import { formatKES } from "@/domain/money";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/domain";

/** Pill radio group of variants, each with its price (DESIGN_SYSTEM.md §9.3). */
export function VariantPicker({
  variants,
  value,
  onChange,
}: {
  variants: ProductVariant[];
  value: string;
  onChange: (variant: ProductVariant) => void;
}) {
  if (variants.length < 2) return null;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-ink-900">Choose an option</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const selected = variant.id === value;
          const soldOut = variant.trackInventory && variant.stockQuantity < variant.minOrderQty;
          return (
            <label
              key={variant.id}
              className={cn(
                "inline-flex min-h-11 cursor-pointer flex-col justify-center rounded-2xl border px-4 py-1.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                selected
                  ? "border-forest-900 bg-forest-900 text-white"
                  : "border-ink-400 bg-white text-ink-900 hover:bg-forest-50",
              )}
            >
              <input
                type="radio"
                name="variant"
                value={variant.id}
                checked={selected}
                onChange={() => onChange(variant)}
                className="sr-only"
              />
              <span className="font-semibold">{variant.name}</span>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  selected ? "text-forest-200" : "text-ink-600",
                )}
              >
                {formatKES(variant.priceMinor)}
                {soldOut ? " · out of stock" : ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
