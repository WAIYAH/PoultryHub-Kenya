import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Link, data, isRouteErrorResponse } from "react-router";
import { notifySuccess } from "@/lib/notify";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { PlaceholderNotice } from "@/components/shared/placeholder-notice";
import { PriceDisplay } from "@/components/shared/price-display";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { ResponsiveImage } from "@/components/shared/responsive-image";
import { StockBadge } from "@/components/shared/stock-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { clampQuantity, formatQuantity, type QuantityRule } from "@/domain/units";
import { useCartStore } from "@/features/cart";
import { absoluteUrl, pageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { getServices } from "@/services";
import type { ProductDetail, ProductVariant } from "@/types/domain";

import type { Route } from "./+types/product";

// Spike S1 (ARCHITECTURE.md §14.2): `loader` runs at build time for pre-rendered slugs;
// `clientLoader` serves client navigations and slugs that weren't pre-rendered (SPA fallback).
// The full product page (gallery, delivery info, related products) is built in Phase 2.

async function loadProduct(slug: string) {
  const product = await getServices().catalog.getProduct(slug);
  if (!product) throw data(null, { status: 404, statusText: "Product not found" });
  return { product };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadProduct(params.productSlug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadProduct(params.productSlug);
}

export function HydrateFallback() {
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-2" aria-busy="true">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
      <span className="sr-only">Loading product…</span>
    </Container>
  );
}

function productJsonLd(product: ProductDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    category: product.category.name,
    ...(product.image ? { image: [absoluteUrl(product.image.src)] } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      name: variant.name,
      sku: variant.sku,
      price: (variant.priceMinor / 100).toFixed(2),
      priceCurrency: "KES",
      availability:
        !variant.trackInventory || variant.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  };
}

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData) {
    return pageMeta({
      title: "Product not found",
      description: "This product is not available.",
      path: location.pathname,
      noindex: true,
    });
  }
  const { product } = loaderData;
  return pageMeta({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${product.slug}`,
    type: "product",
    image: product.image ? { url: product.image.src, alt: product.image.alt } : null,
    jsonLd: productJsonLd(product),
  });
};

function quantityRule(variant: ProductVariant): QuantityRule {
  return {
    min: variant.minOrderQty,
    step: variant.orderStep,
    max: variant.maxOrderQty,
    available: variant.trackInventory ? variant.stockQuantity : null,
  };
}

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
  const { product } = loaderData;
  const initialVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initialVariant?.id);
  const variant = product.variants.find((v) => v.id === variantId) ?? initialVariant;
  const [quantity, setQuantity] = useState(initialVariant?.minOrderQty ?? 1);
  const addItem = useCartStore((state) => state.addItem);

  if (!variant) return null;
  const rule = quantityRule(variant);
  const orderable =
    product.purchaseMode === "cart" && clampQuantity(variant.minOrderQty, rule) !== null;

  function selectVariant(next: ProductVariant) {
    setVariantId(next.id);
    setQuantity(next.minOrderQty);
  }

  function addToCart() {
    if (!variant || !orderable) return;
    addItem({
      variantId: variant.id,
      quantity,
      snapshot: {
        productSlug: product.slug,
        productName: product.name,
        variantName: variant.name,
        unit: variant.unit,
        unitPriceMinor: variant.priceMinor,
        imageSrc: product.image?.src ?? null,
      },
    });
    notifySuccess(
      `Added ${formatQuantity(quantity, variant.unit)} of ${product.name} to your cart`,
    );
  }

  return (
    <>
      <PageHeader
        title={product.name}
        description={product.shortDescription}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Shop", href: "/shop" },
          { label: product.category.name, href: `/shop/${product.category.slug}` },
          { label: product.name },
        ]}
      />
      <Container className="grid gap-10 py-10 lg:grid-cols-2 lg:gap-14">
        <ResponsiveImage
          src={product.image?.src}
          alt={product.image?.alt ?? product.name}
          width={800}
          height={800}
          priority
          className="rounded-lg"
        />
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <StockBadge availability={product.availability} availableFrom={variant.availableFrom} />
            {product.collectionOnly ? (
              <span className="text-sm font-medium text-ink-600">Pick-up only</span>
            ) : null}
          </div>
          <PriceDisplay
            priceMinor={variant.priceMinor}
            unit={variant.unit}
            compareAtMinor={variant.compareAtPriceMinor}
            size="lg"
          />

          {product.variants.length > 1 ? (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-ink-900">Choose an option</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center rounded-full border px-4 text-sm font-semibold transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                      option.id === variant.id
                        ? "border-forest-900 bg-forest-900 text-white"
                        : "border-ink-400 bg-white text-ink-900 hover:bg-forest-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={option.id}
                      checked={option.id === variant.id}
                      onChange={() => selectVariant(option)}
                      className="sr-only"
                    />
                    {option.name}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          {orderable ? (
            <div className="flex flex-col gap-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                rule={rule}
                unit={variant.unit}
              />
              <Button
                size="lg"
                className="w-full sm:w-fit"
                onClick={addToCart}
                data-testid="add-to-cart"
              >
                <ShoppingBag aria-hidden="true" /> Add to cart
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 text-ink-700">
            <h2 className="text-h3 text-ink-900">About this product</h2>
            <p>{product.description}</p>
          </div>

          {product.specifications.length > 0 ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-lg bg-white p-5 text-sm shadow-card">
              {product.specifications.map((spec) => (
                <div key={spec.label} className="contents">
                  <dt className="font-semibold text-ink-900">{spec.label}</dt>
                  <dd className="text-ink-700">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <PlaceholderNotice
            phase={2}
            summary="Gallery, delivery details, FAQs and related products are added in Phase 2."
          />
        </div>
      </Container>
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Container className="flex flex-col items-center gap-5 py-20 text-center">
      <h1 className="text-h1 text-ink-900">
        {notFound ? "Product not found" : "We couldn't load this product"}
      </h1>
      <p className="max-w-lg text-lead text-ink-600">
        {notFound
          ? "This product may have been removed or renamed. Browse the shop to find something similar."
          : "Please check your connection and try again."}
      </p>
      <Button asChild>
        <Link to="/shop">Browse the shop</Link>
      </Button>
    </Container>
  );
}
