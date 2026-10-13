import { CircleAlert, Egg, Trash2 } from "lucide-react";
import { Link } from "react-router";

import { QuantitySelector } from "@/components/shared/quantity-selector";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/domain/money";
import { clampQuantity, formatQuantity, unitLabel, type QuantityRule } from "@/domain/units";
import { cn } from "@/lib/utils";
import type { QuoteLine } from "@/types/domain";

import { useCartStore, type CartLine } from "../cart.store";
import { thumbnailSrc } from "../use-add-to-cart";

interface Notice {
  text: string;
  action?: { label: string; run: () => void };
  tone: "warning" | "danger" | "info";
}

/**
 * What the server quote says about a line, with a one-tap fix where one exists (CART-01, CART-04):
 * a new price to accept, a quantity to correct, or an item to remove.
 */
function lineNotices(
  line: CartLine,
  quoteLine: QuoteLine | undefined,
  actions: {
    setQuantity: (quantity: number) => void;
    remove: () => void;
    acceptPrice: (priceMinor: number) => void;
  },
): Notice[] {
  if (!quoteLine) return [];
  const notices: Notice[] = [];
  const { unit } = quoteLine;
  const rule: QuantityRule = quoteLine.rule;

  for (const issue of quoteLine.issues) {
    switch (issue.code) {
      case "UNAVAILABLE":
        notices.push({
          tone: "danger",
          text: "This item is no longer available to order online.",
          action: { label: "Remove", run: actions.remove },
        });
        break;
      case "INSUFFICIENT_STOCK": {
        const fix = clampQuantity(line.quantity, rule);
        notices.push(
          fix === null
            ? {
                tone: "danger",
                text: "Out of stock right now.",
                action: { label: "Remove", run: actions.remove },
              }
            : {
                tone: "warning",
                text: `Only ${formatQuantity(issue.available, unit)} left.`,
                action: { label: `Change to ${fix}`, run: () => actions.setQuantity(fix) },
              },
        );
        break;
      }
      case "QUANTITY_RULE": {
        const fix = clampQuantity(line.quantity, rule);
        const parts = [
          issue.min > 1 ? `minimum ${formatQuantity(issue.min, unit)}` : null,
          issue.step > 1 ? `in multiples of ${issue.step}` : null,
          issue.max !== null ? `up to ${formatQuantity(issue.max, unit)}` : null,
        ].filter(Boolean);
        notices.push({
          tone: "warning",
          text: `Sold ${parts.join(", ")}.`,
          ...(fix !== null
            ? { action: { label: `Change to ${fix}`, run: () => actions.setQuantity(fix) } }
            : {}),
        });
        break;
      }
      case "COLLECTION_ONLY":
        notices.push({ tone: "info", text: "Pick-up only: this item can't be delivered." });
        break;
    }
  }

  const unavailable = quoteLine.issues.some((issue) => issue.code === "UNAVAILABLE");
  if (!unavailable && quoteLine.unitPriceMinor !== line.snapshot.unitPriceMinor) {
    notices.unshift({
      tone: "warning",
      text: `Price changed from ${formatKES(line.snapshot.unitPriceMinor)} to ${formatKES(quoteLine.unitPriceMinor)} per ${unitLabel(unit)}.`,
      action: { label: "OK", run: () => actions.acceptPrice(quoteLine.unitPriceMinor) },
    });
  }
  return notices;
}

const NOTICE_TONES = {
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info-fg",
} as const;

export function CartLineItem({
  line,
  quoteLine,
  quoteLoading,
  onNavigate,
}: {
  line: CartLine;
  quoteLine: QuoteLine | undefined;
  quoteLoading: boolean;
  /** Called when a product link is followed (the drawer closes itself). */
  onNavigate?: () => void;
}) {
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateSnapshot = useCartStore((state) => state.updateSnapshot);
  const { snapshot } = line;
  const unit = quoteLine?.unit ?? snapshot.unit;
  const rule: QuantityRule = quoteLine?.rule ?? { min: 1, step: 1 };
  const imageSrc = thumbnailSrc(quoteLine?.image ?? null) ?? snapshot.imageSrc ?? null;
  const notices = lineNotices(line, quoteLine, {
    setQuantity: (quantity) => setQuantity(line.variantId, quantity),
    remove: () => removeItem(line.variantId),
    acceptPrice: (priceMinor) => updateSnapshot(line.variantId, { unitPriceMinor: priceMinor }),
  });
  // When the server no longer knows the item, keep showing what the customer added.
  const known = quoteLine !== undefined && quoteLine.productSlug !== "" ? quoteLine : undefined;
  const name = known?.productName ?? snapshot.productName;

  return (
    <li className="flex gap-3 py-4" data-testid="cart-line" data-variant-id={line.variantId}>
      <Link
        to={`/products/${snapshot.productSlug}`}
        onClick={onNavigate}
        tabIndex={-1}
        aria-hidden="true"
        className="size-18 shrink-0 overflow-hidden rounded-md bg-cream-100"
      >
        {imageSrc ? (
          <img src={imageSrc} alt="" width={72} height={72} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-earth-700">
            <Egg className="size-6 opacity-60" strokeWidth={1.5} />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/products/${snapshot.productSlug}`}
              onClick={onNavigate}
              className="line-clamp-2 font-semibold text-ink-900 hover:underline"
            >
              {name}
            </Link>
            <p className="text-sm text-ink-600">
              {known?.variantName ?? snapshot.variantName} ·{" "}
              <span data-tabular>
                {formatKES(quoteLine?.unitPriceMinor ?? snapshot.unitPriceMinor)} /{" "}
                {unitLabel(unit)}
              </span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${name} from cart`}
            onClick={() => removeItem(line.variantId)}
            className="-mt-1 -mr-1 shrink-0 text-ink-600"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <QuantitySelector
            value={line.quantity}
            onChange={(quantity) => setQuantity(line.variantId, quantity)}
            rule={rule}
            unit={unit}
            label={`Quantity of ${name}`}
            labelHidden
            compact
          />
          <div className="font-bold text-ink-900" data-tabular>
            {quoteLine ? (
              <span className={cn(quoteLoading && "opacity-60")}>
                {formatKES(quoteLine.lineTotalMinor)}
              </span>
            ) : (
              <Skeleton className="h-5 w-16" />
            )}
          </div>
        </div>

        {notices.length > 0 ? (
          <ul className="flex flex-col gap-1.5" aria-live="polite">
            {notices.map((notice) => (
              <li
                key={notice.text}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-sm px-2.5 py-1.5 text-sm",
                  NOTICE_TONES[notice.tone],
                )}
              >
                <span className="flex items-start gap-1.5">
                  <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  {notice.text}
                </span>
                {notice.action ? (
                  <button
                    type="button"
                    onClick={notice.action.run}
                    className="min-h-8 shrink-0 rounded-full px-2 font-semibold underline underline-offset-2 hover:no-underline"
                  >
                    {notice.action.label}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
