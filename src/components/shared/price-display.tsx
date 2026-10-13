import { formatKES } from "@/domain/money";
import { unitLabel } from "@/domain/units";
import { cn } from "@/lib/utils";
import type { MinorUnits, SaleUnit } from "@/types/domain";

const sizes = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
} as const;

/**
 * "KSh 520 / tray" (DESIGN_SYSTEM.md §9.3). A compare-at price is shown only for a genuine
 * previous price, and is announced as "was".
 */
export function PriceDisplay({
  priceMinor,
  unit,
  compareAtMinor,
  from = false,
  size = "md",
  className,
}: {
  priceMinor: MinorUnits;
  unit?: SaleUnit;
  compareAtMinor?: MinorUnits | null;
  /** Prefix with "From" when a product has several variant prices. */
  from?: boolean;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)} data-tabular>
      {from ? <span className="text-sm font-medium text-ink-600">From</span> : null}
      <span className={cn("font-bold text-ink-900", sizes[size])}>{formatKES(priceMinor)}</span>
      {unit ? <span className="text-sm font-medium text-ink-600">/ {unitLabel(unit)}</span> : null}
      {compareAtMinor && compareAtMinor > priceMinor ? (
        <span className="text-sm text-ink-600">
          <span className="sr-only">was </span>
          <s>{formatKES(compareAtMinor)}</s>
        </span>
      ) : null}
    </p>
  );
}
