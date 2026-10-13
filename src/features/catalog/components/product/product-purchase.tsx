import { MessageCircleQuestion, ShoppingBag, Store, Truck } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router";

import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { PriceDisplay } from "@/components/shared/price-display";
import { QuantitySelector } from "@/components/shared/quantity-selector";
import { StockBadge } from "@/components/shared/stock-badge";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { deriveAvailability } from "@/domain/availability";
import { formatShortDate } from "@/domain/dates";
import { formatKES } from "@/domain/money";
import { clampQuantity, formatQuantity, unitLabel, type QuantityRule } from "@/domain/units";
import { whatsappMessages } from "@/domain/whatsapp";
import { useAddToCart } from "@/features/cart";
import { useSiteSettings, useWhatsappHref } from "@/features/content";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { DeliveryZone, ProductDetail, ProductVariant } from "@/types/domain";

import { VariantPicker } from "./variant-picker";

function ruleFor(variant: ProductVariant): QuantityRule {
  return {
    min: variant.minOrderQty,
    step: variant.orderStep,
    max: variant.maxOrderQty,
    available: variant.trackInventory ? variant.stockQuantity : null,
  };
}

/** KM-10: past this quantity, suggest a wholesale quote. */
function bulkThreshold(variant: ProductVariant): number {
  return Math.max(variant.minOrderQty * 5, 10);
}

/**
 * The buy box (CAT-05): option, quantity within the rules (BR-06), add to cart, availability,
 * delivery note and WhatsApp enquiry, plus the sticky mobile buy bar. Enquiry-only products get a
 * quote request instead of a cart button (CAT-07).
 */
export function ProductPurchase({
  product,
  zones,
}: {
  product: ProductDetail;
  zones: DeliveryZone[];
}) {
  const settings = useSiteSettings();
  const addToCart = useAddToCart();
  const initial = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const [variantId, setVariantId] = useState(initial?.id ?? "");
  const variant = product.variants.find((v) => v.id === variantId) ?? initial;
  const [requested, setRequested] = useState(() =>
    initial ? (clampQuantity(initial.minOrderQty, ruleFor(initial)) ?? initial.minOrderQty) : 1,
  );
  const whatsappHref = useWhatsappHref(
    whatsappMessages.productEnquiry({
      businessName: settings.businessName,
      productName: product.name,
      variantName: variant && product.variants.length > 1 ? variant.name : undefined,
      url: absoluteUrl(`/products/${product.slug}`),
    }),
  );
  const buyRef = useRef<HTMLDivElement>(null);

  if (!variant) return null;
  const rule = ruleFor(variant);
  // Stock can drop when prices and stock revalidate; always show a quantity that's still valid.
  const quantity = clampQuantity(requested, rule) ?? variant.minOrderQty;
  const orderable =
    product.purchaseMode === "cart" && clampQuantity(variant.minOrderQty, rule) !== null;
  const availability = deriveAvailability({
    purchaseMode: product.purchaseMode,
    variants: [variant],
  });
  const preOrderDate =
    availability === "pre_order" && variant.availableFrom
      ? formatShortDate(`${variant.availableFrom}T09:00:00+03:00`)
      : null;
  const lowCount =
    availability === "low_stock" && settings.orders.showLowStockCounts
      ? variant.stockQuantity
      : null;
  const cheapestZone = [...zones].sort((a, b) => a.feeMinor - b.feeMinor)[0];

  function selectVariant(next: ProductVariant) {
    setVariantId(next.id);
    setRequested(clampQuantity(next.minOrderQty, ruleFor(next)) ?? next.minOrderQty);
  }

  function add() {
    if (!variant || !orderable) return;
    addToCart({
      product,
      variant: {
        id: variant.id,
        name: variant.name,
        unit: variant.unit,
        priceMinor: variant.priceMinor,
      },
      quantity,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          to={`/shop/${product.category.slug}`}
          className="w-fit text-eyebrow text-forest-800 underline-offset-4 hover:underline"
        >
          {product.category.name}
        </Link>
        <h1 className="text-h1 text-ink-900">{product.name}</h1>
        <p className="text-lead text-ink-700">{product.shortDescription}</p>
      </div>

      <div className="flex flex-col gap-2">
        {product.purchaseMode === "enquiry" ? (
          <p className="text-sm text-ink-700">
            Indicative price: <span className="font-semibold">{formatKES(variant.priceMinor)}</span>{" "}
            / {unitLabel(variant.unit)}. We'll quote for your volume.
          </p>
        ) : (
          <PriceDisplay
            priceMinor={variant.priceMinor}
            unit={variant.unit}
            compareAtMinor={variant.compareAtPriceMinor}
            size="lg"
          />
        )}
        {variant.unitDescription ? (
          <p className="text-sm text-ink-600">{variant.unitDescription}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <StockBadge
            availability={availability}
            availableFrom={variant.availableFrom}
            lowStockCount={lowCount}
          />
          {preOrderDate ? (
            <span className="text-sm text-ink-700">Book now, collect from {preOrderDate}.</span>
          ) : null}
          {product.collectionOnly ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-700">
              <Store aria-hidden="true" className="size-4" /> Pick-up only
            </span>
          ) : null}
        </div>
      </div>

      <VariantPickerSlot product={product} value={variant.id} onChange={selectVariant} />

      <div ref={buyRef} className="flex flex-col gap-4">
        {product.purchaseMode === "enquiry" ? (
          <Button asChild size="lg" className="w-full sm:w-fit">
            <Link
              to={`/contact?subject=wholesale_quote&product=${encodeURIComponent(product.slug)}`}
            >
              <MessageCircleQuestion aria-hidden="true" /> Request a quote
            </Link>
          </Button>
        ) : orderable ? (
          <>
            <div className="flex flex-wrap items-start gap-x-6 gap-y-2">
              <QuantitySelector
                value={quantity}
                onChange={setRequested}
                rule={rule}
                unit={variant.unit}
              />
              <p className="pt-7 text-sm text-ink-700" data-tabular aria-live="polite">
                Total:{" "}
                <span className="text-base font-bold text-ink-900">
                  {formatKES(variant.priceMinor * quantity)}
                </span>
              </p>
            </div>
            <Button size="lg" className="w-full sm:w-fit" onClick={add} data-testid="add-to-cart">
              <ShoppingBag aria-hidden="true" />
              {availability === "pre_order" ? "Book now" : "Add to cart"}
            </Button>
            {quantity >= bulkThreshold(variant) ? (
              <p className="rounded-md bg-gold-100 px-4 py-3 text-sm text-gold-800">
                Buying {formatQuantity(quantity, variant.unit)} or more regularly?{" "}
                <Link
                  to="/contact?subject=wholesale_quote"
                  className="font-semibold underline underline-offset-4"
                >
                  Ask for a wholesale quote
                </Link>
                .
              </p>
            ) : null}
          </>
        ) : (
          <Button size="lg" variant="outline" className="w-full sm:w-fit" disabled>
            Out of stock
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-5 text-sm text-ink-700">
        <p className="flex items-start gap-2">
          {product.collectionOnly ? (
            <>
              <Store aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
              <span>
                Collect from our pick-up points.{" "}
                <a
                  href="#delivery"
                  className="font-semibold text-forest-700 underline-offset-4 hover:underline"
                >
                  Pick-up details
                </a>
              </span>
            </>
          ) : (
            <>
              <Truck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
              <span>
                {cheapestZone
                  ? `Delivery from ${formatKES(cheapestZone.feeMinor)} to served areas, or free pick-up. `
                  : "Free pick-up from our pick-up points. "}
                <a
                  href="#delivery"
                  className="font-semibold text-forest-700 underline-offset-4 hover:underline"
                >
                  Delivery details
                </a>
              </span>
            </>
          )}
        </p>
        <WhatsAppLink
          href={whatsappHref}
          className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-fit")}
        >
          <WhatsAppIcon className="size-5" />
          {orderable || product.purchaseMode === "enquiry"
            ? "Ask about this on WhatsApp"
            : "Ask when it's back"}
        </WhatsAppLink>
      </div>

      {orderable ? (
        <StickyBuyBar
          targetRef={buyRef}
          name={product.name}
          priceText={`${formatKES(variant.priceMinor * quantity)} · ${formatQuantity(quantity, variant.unit)}`}
          label={availability === "pre_order" ? "Book now" : "Add to cart"}
          onAdd={add}
        />
      ) : null}
    </div>
  );
}

function VariantPickerSlot({
  product,
  value,
  onChange,
}: {
  product: ProductDetail;
  value: string;
  onChange: (variant: ProductVariant) => void;
}) {
  if (product.variants.length < 2) return null;
  return <VariantPicker variants={product.variants} value={value} onChange={onChange} />;
}

/**
 * Mobile buy bar (DESIGN_SYSTEM.md §10.2): shown below `lg` whenever the main buy controls are off
 * screen. While shown it sets --sticky-bar-height, which lifts the floating WhatsApp button and
 * pads the page so nothing is hidden behind it.
 */
function StickyBuyBar({
  targetRef,
  name,
  priceText,
  label,
  onAdd,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
  name: string;
  priceText: string;
  label: string;
  onAdd: () => void;
}) {
  const hydrated = useHydrated();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry?.isIntersecting));
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  useEffect(() => {
    const narrow = window.matchMedia("(max-width: 1023px)");
    const root = document.documentElement;
    const sync = () =>
      visible && narrow.matches
        ? root.style.setProperty("--sticky-bar-height", "4.75rem")
        : root.style.removeProperty("--sticky-bar-height");
    sync();
    narrow.addEventListener("change", sync);
    return () => {
      narrow.removeEventListener("change", sync);
      root.style.removeProperty("--sticky-bar-height");
    };
  }, [visible]);

  if (!hydrated) return null;
  return (
    <div
      data-testid="sticky-buy-bar"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-raised backdrop-blur-md transition-transform duration-200 ease-standard lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{name}</p>
          <p className="truncate text-sm text-ink-700" data-tabular>
            {priceText}
          </p>
        </div>
        <Button onClick={onAdd} className="shrink-0">
          <ShoppingBag aria-hidden="true" /> {label}
        </Button>
      </div>
    </div>
  );
}
