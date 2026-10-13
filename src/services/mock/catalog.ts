import { deriveAvailability, todayInEat } from "@/domain/availability";
import { categories, products, type FixtureProduct } from "@/mocks/fixtures/catalog";
import type {
  Category,
  Page,
  ProductDetail,
  ProductQuery,
  ProductSummary,
  ProductVariant,
} from "@/types/domain";

import type { CatalogService } from "../contracts";

import { mockRequest } from "./latency";
import type { MockScenario } from "./scenario";
import { readState, type DemoState } from "./state";

/** `?mock=price-changed` raises every price by this much (KSh 20). */
export const PRICE_CHANGE_MINOR = 2_000;

/** Units held by orders placed in the demo and not cancelled (BR-08). */
function reservedUnits(state: DemoState): Map<string, number> {
  const reserved = new Map<string, number>();
  for (const order of state.orders) {
    if (!order.reservesStock || order.status === "cancelled") continue;
    for (const item of order.items) {
      reserved.set(item.variantId, (reserved.get(item.variantId) ?? 0) + item.quantity);
    }
  }
  return reserved;
}

function effectiveVariant(
  variant: ProductVariant,
  reserved: number,
  scenarios: ReadonlySet<MockScenario>,
): ProductVariant {
  let stock = variant.trackInventory
    ? Math.max(0, variant.stockQuantity - reserved)
    : variant.stockQuantity;
  if (scenarios.has("low-stock") && variant.trackInventory) {
    stock = Math.min(stock, variant.minOrderQty);
  }
  const priceBump = scenarios.has("price-changed") ? PRICE_CHANGE_MINOR : 0;
  return { ...variant, priceMinor: variant.priceMinor + priceBump, stockQuantity: stock };
}

function toDetail(
  product: FixtureProduct,
  reserved: Map<string, number>,
  scenarios: ReadonlySet<MockScenario>,
  today: string,
): ProductDetail {
  const category = categories.find((c) => c.slug === product.categorySlug);
  if (!category) {
    throw new Error(
      `Fixture product ${product.slug} references unknown category ${product.categorySlug}`,
    );
  }
  const variants = product.variants.map((v) =>
    effectiveVariant(v, reserved.get(v.id) ?? 0, scenarios),
  );
  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  if (!defaultVariant) throw new Error(`Fixture product ${product.slug} has no variants`);
  const prices = variants.map((v) => v.priceMinor);
  const {
    categorySlug: _categorySlug,
    fixture: _fixture,
    searchKeywords: _keywords,
    ...rest
  } = product;

  return {
    ...rest,
    variants,
    image: product.images[0] ?? null,
    category: { slug: category.slug, name: category.name },
    fromPriceMinor: Math.min(...prices),
    hasPriceRange: new Set(prices).size > 1,
    defaultUnit: defaultVariant.unit,
    availability: deriveAvailability({ purchaseMode: product.purchaseMode, variants }, today),
    defaultVariant: {
      id: defaultVariant.id,
      name: defaultVariant.name,
      priceMinor: defaultVariant.priceMinor,
      unit: defaultVariant.unit,
      minOrderQty: defaultVariant.minOrderQty,
      orderStep: defaultVariant.orderStep,
      maxOrderQty: defaultVariant.maxOrderQty,
      availableFrom: defaultVariant.availableFrom,
      available: defaultVariant.trackInventory ? defaultVariant.stockQuantity : null,
    },
  };
}

export function toSummary(detail: ProductDetail): ProductSummary {
  const {
    description: _description,
    variants: _variants,
    images: _images,
    specifications: _specifications,
    collectionOnly: _collectionOnly,
    ...summary
  } = detail;
  return summary;
}

/** The catalogue as the storefront sees it right now: demo reservations and scenarios applied. */
export function storefrontProducts(scenarios: ReadonlySet<MockScenario>): ProductDetail[] {
  const reserved = reservedUnits(readState());
  const today = todayInEat();
  return products.map((product) => toDetail(product, reserved, scenarios, today));
}

/** Search terms per product slug (names plus Swahili synonyms, CAT-12). */
export function searchTermsFor(slug: string): string[] {
  return products.find((p) => p.slug === slug)?.searchKeywords ?? [];
}

const SORTERS: Record<
  NonNullable<ProductQuery["sort"]>,
  (a: ProductSummary, b: ProductSummary) => number
> = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || a.name.localeCompare(b.name),
  "price-asc": (a, b) => a.fromPriceMinor - b.fromPriceMinor || a.name.localeCompare(b.name),
  "price-desc": (a, b) => b.fromPriceMinor - a.fromPriceMinor || a.name.localeCompare(b.name),
  newest: (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.name.localeCompare(b.name),
  name: (a, b) => a.name.localeCompare(b.name),
};

/** True when every word of the query appears in the product's text or keywords. */
export function matchesProductQuery(product: ProductDetail, query: string): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = [
    product.name,
    product.shortDescription,
    product.category.name,
    ...product.variants.map((v) => v.name),
    ...searchTermsFor(product.slug),
  ]
    .join(" ")
    .toLowerCase();
  return words.every((word) => haystack.includes(word));
}

export function createMockCatalogService(): CatalogService {
  return {
    async listCategories(): Promise<Category[]> {
      const scenarios = await mockRequest();
      const all = storefrontProducts(scenarios);
      return categories.map((category) => {
        const inCategory = all.filter((p) => p.category.slug === category.slug);
        return {
          ...category,
          productCount: inCategory.length,
          fromPriceMinor:
            inCategory.length > 0 ? Math.min(...inCategory.map((p) => p.fromPriceMinor)) : null,
        };
      });
    },

    async listProducts(query: ProductQuery = {}): Promise<Page<ProductSummary>> {
      const scenarios = await mockRequest();
      const { page = 1, pageSize = 24, sort = "featured" } = query;
      if (scenarios.has("empty")) return { items: [], total: 0, page, pageSize };
      const filtered = storefrontProducts(scenarios)
        .filter((p) => !query.category || p.category.slug === query.category)
        .filter((p) => query.featured === undefined || p.isFeatured === query.featured)
        .filter((p) => !query.availability?.length || query.availability.includes(p.availability))
        .filter((p) => query.minPriceMinor === undefined || p.fromPriceMinor >= query.minPriceMinor)
        .filter((p) => query.maxPriceMinor === undefined || p.fromPriceMinor <= query.maxPriceMinor)
        .filter((p) => !query.q || matchesProductQuery(p, query.q))
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
      const scenarios = await mockRequest();
      return storefrontProducts(scenarios).find((p) => p.slug === slug) ?? null;
    },

    async listRelated(productId, limit = 4) {
      const scenarios = await mockRequest();
      if (scenarios.has("empty")) return [];
      const all = storefrontProducts(scenarios);
      const product = all.find((p) => p.id === productId);
      if (!product) return [];
      const sameCategory = all.filter(
        (p) => p.id !== productId && p.category.slug === product.category.slug,
      );
      // Prefer products that can be bought now, then featured ones.
      const rank = (p: ProductDetail) =>
        (p.availability === "out_of_stock" ? 2 : 0) + (p.isFeatured ? 0 : 1);
      return sameCategory
        .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name))
        .slice(0, limit)
        .map(toSummary);
    },
  };
}
