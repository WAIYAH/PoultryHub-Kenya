import { ChevronDown, Egg } from "lucide-react";
import { useId, useState } from "react";

import { formatKES } from "@/domain/money";
import { formatQuantity } from "@/domain/units";
import { CartSummary, PromoCodeField, useCartStore } from "@/features/cart";
import { cn } from "@/lib/utils";
import type { CartQuote } from "@/types/domain";

/**
 * What's being bought and what it costs (DESIGN_SYSTEM.md §9.3 OrderSummary): sticky beside the
 * form on desktop; on mobile a "Show order summary" bar at the top that opens it.
 */
export function OrderSummary({
  quote,
  pending,
  className,
}: {
  quote: CartQuote | undefined;
  pending: boolean;
  className?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const lines = useCartStore((state) => state.lines);
  const promoCode = useCartStore((state) => state.promoCode);
  const setPromoCode = useCartStore((state) => state.setPromoCode);

  return (
    <aside
      aria-label="Order summary"
      className={cn("rounded-lg bg-white shadow-card lg:sticky lg:top-6", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left font-semibold text-forest-800 lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          {open ? "Hide order summary" : "Show order summary"}
          <ChevronDown
            aria-hidden="true"
            className={cn("size-4 transition-transform", open && "rotate-180")}
          />
        </span>
        <span className="text-ink-900" data-tabular>
          {quote ? formatKES(quote.totalMinor) : "…"}
        </span>
      </button>

      <div
        id={`${id}-body`}
        className={cn(
          "flex-col gap-5 border-t border-line p-5 sm:p-6 lg:flex lg:border-t-0",
          open ? "flex" : "hidden",
        )}
      >
        <h2 className="hidden text-h3 text-ink-900 lg:block">Order summary</h2>
        <ul className="flex flex-col gap-3" data-testid="checkout-items">
          {lines.map((line) => {
            const quoted = quote?.lines.find((q) => q.variantId === line.variantId);
            const name = quoted?.productName ?? line.snapshot.productName;
            return (
              <li key={line.variantId} className="flex items-center gap-3 text-sm">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-cream-100">
                  {line.snapshot.imageSrc ? (
                    <img
                      src={line.snapshot.imageSrc}
                      alt=""
                      width={48}
                      height={48}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="grid size-full place-items-center text-earth-700">
                      <Egg aria-hidden="true" className="size-5 opacity-60" strokeWidth={1.5} />
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-1 font-semibold text-ink-900">{name}</span>
                  <span className="block text-ink-600">
                    {quoted?.variantName ?? line.snapshot.variantName} ·{" "}
                    {formatQuantity(line.quantity, line.snapshot.unit)}
                  </span>
                </span>
                <span className="font-semibold text-ink-900" data-tabular>
                  {quoted ? formatKES(quoted.lineTotalMinor) : "…"}
                </span>
              </li>
            );
          })}
        </ul>
        <PromoCodeField
          code={promoCode}
          quote={quote}
          pending={pending}
          onApply={setPromoCode}
          onRemove={() => setPromoCode(null)}
        />
        <CartSummary
          quote={quote}
          itemCount={lines.length}
          pending={pending}
          deliveryPendingText="Choose your area"
        />
      </div>
    </aside>
  );
}
