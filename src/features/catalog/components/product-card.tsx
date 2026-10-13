import { CalendarClock, CircleCheck, MessageCircleQuestion, ShoppingBag } from "lucide-react";
import { Link } from "react-router";

import { PriceDisplay } from "@/components/shared/price-display";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { StockBadge } from "@/components/shared/stock-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatShortDate } from "@/domain/dates";
import { clampQuantity, formatQuantity } from "@/domain/units";
import { useAddToCart } from "@/features/cart";
import { useSiteSettings } from "@/features/content";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/domain";

/** Card image sizes for the 2 → 3 → 4 column grid (DESIGN_SYSTEM.md §5). */
export const PRODUCT_CARD_SIZES = "(min-width: 1280px) 276px, (min-width: 768px) 31vw, 46vw";

function availabilityText(product: ProductSummary, showCounts: boolean): string {
  const { availability, defaultVariant } = product;
  switch (availability) {
    case "in_stock":
      return "In stock";
    case "low_stock":
      return showCounts && defaultVariant.available
        ? `Only ${formatQuantity(defaultVariant.available, defaultVariant.unit)} left`
        : "Low stock";
    case "pre_order":
      return defaultVariant.availableFrom
        ? `Ready from ${formatShortDate(`${defaultVariant.availableFrom}T09:00:00+03:00`)}`
        : "Available to book";
    case "out_of_stock":
      return "Out of stock: check back soon";
    case "enquiry":
      return "Price on request";
  }
}

/**
 * Product card (CAT-01, DESIGN_SYSTEM.md §9.3). The product name is the card's one link, stretched
 * over the whole card; the add button is a separate control that adds the minimum order quantity.
 */
export function ProductCard({
  product,
  variant = "default",
  priority = false,
  headingLevel = 3,
  showFeaturedBadge = true,
}: {
  product: ProductSummary;
  variant?: "default" | "compact";
  priority?: boolean;
  headingLevel?: 2 | 3;
  /** Off in the featured section itself, where the badge would say nothing. */
  showFeaturedBadge?: boolean;
}) {
  const settings = useSiteSettings();
  const addToCart = useAddToCart();
  const { defaultVariant: dv } = product;
  const rule = {
    min: dv.minOrderQty,
    step: dv.orderStep,
    max: dv.maxOrderQty,
    available: dv.available,
  };
  const addQuantity = product.purchaseMode === "cart" ? clampQuantity(dv.minOrderQty, rule) : null;
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const href = `/products/${product.slug}`;
  const compact = variant === "compact";

  return (
    <article
      data-testid="product-card"
      className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card transition-shadow duration-200 hover:shadow-raised has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2"
    >
      <div className="relative overflow-hidden">
        <ResponsiveImage
          {...imageProps(product.image, product.name)}
          sizes={PRODUCT_CARD_SIZES}
          priority={priority}
          label={product.name}
          className="aspect-square transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1.5">
          {product.isFeatured && showFeaturedBadge && !compact ? (
            <Badge variant="featured">Featured</Badge>
          ) : null}
          {product.availability !== "in_stock" ? (
            <StockBadge availability={product.availability} />
          ) : null}
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col gap-2", compact ? "p-3" : "p-4")}>
        {compact ? null : <p className="text-eyebrow text-forest-800">{product.category.name}</p>}
        <Heading className="line-clamp-2 text-base leading-snug font-semibold text-ink-900">
          <Link
            to={href}
            prefetch="intent"
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {product.name}
          </Link>
        </Heading>
        <PriceDisplay
          priceMinor={product.fromPriceMinor}
          unit={product.defaultUnit}
          from={product.hasPriceRange}
          size={compact ? "sm" : "md"}
        />
        <p
          className={cn(
            "flex items-center gap-1.5 text-sm",
            product.availability === "in_stock" ? "text-success-fg" : "text-ink-700",
          )}
        >
          {product.availability === "in_stock" ? (
            <CircleCheck aria-hidden="true" className="size-4 shrink-0" />
          ) : product.availability === "pre_order" ? (
            <CalendarClock aria-hidden="true" className="size-4 shrink-0" />
          ) : null}
          {availabilityText(product, settings.orders.showLowStockCounts)}
        </p>
        {dv.minOrderQty > 1 && product.purchaseMode === "cart" ? (
          <p className="text-sm text-ink-600">Min. {formatQuantity(dv.minOrderQty, dv.unit)}</p>
        ) : null}

        <div className="relative z-10 mt-auto pt-2">
          {product.purchaseMode === "enquiry" ? (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to={href} tabIndex={-1} aria-hidden="true">
                <MessageCircleQuestion aria-hidden="true" /> Request a quote
              </Link>
            </Button>
          ) : addQuantity === null ? (
            <Button variant="outline" size="sm" className="w-full" disabled>
              Out of stock
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full"
              data-testid="card-add-to-cart"
              aria-label={`Add ${formatQuantity(addQuantity, dv.unit)} of ${product.name} to cart`}
              onClick={() =>
                addToCart({
                  product,
                  variant: { id: dv.id, name: dv.name, unit: dv.unit, priceMinor: dv.priceMinor },
                  quantity: addQuantity,
                })
              }
            >
              <ShoppingBag aria-hidden="true" />
              {product.availability === "pre_order"
                ? "Book now"
                : addQuantity > 1
                  ? `Add ${addQuantity}`
                  : "Add to cart"}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
