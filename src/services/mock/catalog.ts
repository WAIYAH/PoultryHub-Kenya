import { deriveAvailability } from "@/domain/availability";
import { categories, products, type FixtureProduct } from "@/mocks/fixtures/catalog";
import type { Page, ProductDetail, ProductQuery, ProductSummary } from "@/types/domain";

import type { CatalogService } from "../contracts";

import { simulateLatency } from "./latency";

function toDetail(product: FixtureProduct): ProductDetail {
  const category = categories.find((c) => c.slug === product.categorySlug);
  if (!category)
    throw new Error(
      `Fixture product ${product.slug} references unknown category ${product.categorySlug}`,
    );
  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  if (!defaultVariant) throw new Error(`Fixture product ${product.slug} has no variants`);
  const { categorySlug: _categorySlug, fixture: _fixture, ...rest } = product;
  return {
    ...rest,
    category: { slug: category.slug, name: category.name },
    fromPriceMinor: Math.min(...product.variants.map((v) => v.priceMinor)),
    defaultUnit: defaultVariant.unit,
    availability: deriveAvailability(product),
  };
}

function toSummary(detail: ProductDetail): ProductSummary {
  const {
    description: _d,
    variants: _v,
    images: _i,
    specifications: _s,
    collectionOnly: _c,
    ...summary
  } = detail;
  return summary;
}

const SORTERS: Record<
  NonNullable<ProductQuery["sort"]>,
  (a: ProductSummary, b: ProductSummary) => number
> = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name),
  "price-asc": (a, b) => a.fromPriceMinor - b.fromPriceMinor,
  "price-desc": (a, b) => b.fromPriceMinor - a.fromPriceMinor,
  newest: () => 0,
  name: (a, b) => a.name.localeCompare(b.name),
};

export function createMockCatalogService(): CatalogService {
  const details = products.map(toDetail);

  return {
    async listCategories() {
      await simulateLatency();
      return categories;
    },

    async listProducts(query: ProductQuery = {}): Promise<Page<ProductSummary>> {
      await simulateLatency();
      const { page = 1, pageSize = 24, sort = "featured" } = query;
      const needle = query.q?.trim().toLowerCase();
      const filtered = details
        .filter((p) => !query.category || p.category.slug === query.category)
        .filter((p) => !query.availability?.length || query.availability.includes(p.availability))
        .filter((p) => query.minPriceMinor === undefined || p.fromPriceMinor >= query.minPriceMinor)
        .filter((p) => query.maxPriceMinor === undefined || p.fromPriceMinor <= query.maxPriceMinor)
        .filter((p) => !needle || `${p.name} ${p.shortDescription}`.toLowerCase().includes(needle))
        .map(toSummary)
        .sort(SORTERS[sort]);
      const start = (page - 1) * pageSize;
      return {
        items: filtered.slice(start, start + pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    },

    async getProduct(slug) {
      await simulateLatency();
      return details.find((p) => p.slug === slug) ?? null;
    },

    async listRelated(productId, limit = 4) {
      await simulateLatency();
      const product = details.find((p) => p.id === productId);
      if (!product) return [];
      return details
        .filter((p) => p.id !== productId && p.category.slug === product.category.slug)
        .slice(0, limit)
        .map(toSummary);
    },
  };
}
