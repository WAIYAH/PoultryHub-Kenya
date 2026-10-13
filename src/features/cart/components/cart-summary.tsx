import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/domain/money";
import { amountToFreeDeliveryMinor } from "@/domain/pricing";
import { cn } from "@/lib/utils";
import type { CartQuote } from "@/types/domain";

function Row({
  label,
  value,
  emphasis = false,
  testId,
}: {
  label: ReactNode;
  value: ReactNode;
  emphasis?: boolean;
  testId?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-4",
        emphasis ? "border-t border-line pt-3 text-lg font-bold text-ink-900" : "text-ink-700",
      )}
    >
      <dt>{label}</dt>
      <dd className="text-right" data-tabular data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}

/**
 * Subtotal, discount, delivery and total from the server quote (CART-04, CART-05). Until a
 * delivery area is chosen the fee reads "Calculated at checkout" and the total is an estimate.
 */
export function CartSummary({
  quote,
  itemCount,
  pending = false,
  deliveryPendingText = "Calculated at checkout",
  className,
}: {
  quote: CartQuote | undefined;
  itemCount: number;
  /** A newer quote is loading: show the previous figures faded. */
  pending?: boolean;
  /** The delivery line before a fee is known. */
  deliveryPendingText?: string;
  className?: string;
}) {
  if (!quote) {
    return (
      <div className={cn("flex flex-col gap-3", className)} aria-busy="true">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-7 w-full" />
        <span className="sr-only">Calculating your total…</span>
      </div>
    );
  }

  const deliveryKnown = quote.deliveryFeeMinor !== null;
  const toFree =
    quote.delivery && deliveryKnown && quote.deliveryFeeMinor !== 0
      ? amountToFreeDeliveryMinor(quote.delivery, quote.subtotalMinor)
      : null;

  return (
    <div className={cn("flex flex-col gap-2", pending && "opacity-60", className)}>
      <dl className="flex flex-col gap-2" aria-live="polite" aria-busy={pending}>
        <Row
          label={`Subtotal (${itemCount} ${itemCount === 1 ? "item" : "items"})`}
          value={formatKES(quote.subtotalMinor)}
          testId="summary-subtotal"
        />
        {quote.discountMinor > 0 ? (
          <Row
            label={quote.promo ? `Discount (${quote.promo.code})` : "Discount"}
            value={`−${formatKES(quote.discountMinor)}`}
            testId="summary-discount"
          />
        ) : null}
        <Row
          label="Delivery"
          testId="summary-delivery"
          value={
            !deliveryKnown ? (
              <span className="text-sm text-ink-600">{deliveryPendingText}</span>
            ) : quote.deliveryFeeMinor === 0 ? (
              quote.delivery ? (
                "Free"
              ) : (
                "Pick-up: free"
              )
            ) : (
              formatKES(quote.deliveryFeeMinor ?? 0)
            )
          }
        />
        <Row
          label={deliveryKnown ? "Total" : "Estimated total"}
          value={formatKES(quote.totalMinor)}
          emphasis
          testId="summary-total"
        />
      </dl>
      {toFree !== null ? (
        <p className="text-sm text-forest-800">
          Add {formatKES(toFree)} more for free delivery to {quote.delivery?.zoneName}.
        </p>
      ) : null}
    </div>
  );
}
