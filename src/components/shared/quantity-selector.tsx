import { Minus, Plus } from "lucide-react";
import { useId, useState } from "react";

import {
  clampQuantity,
  describeQuantityRule,
  formatQuantity,
  stepQuantity,
  unitLabel,
  type QuantityRule,
} from "@/domain/units";
import { cn } from "@/lib/utils";
import type { SaleUnit } from "@/types/domain";

function limitMessage(
  requested: number,
  accepted: number,
  rule: QuantityRule,
  unit: SaleUnit,
): string {
  if (requested < rule.min) return `The minimum order is ${formatQuantity(rule.min, unit)}.`;
  if (accepted < requested && (requested - rule.min) % rule.step === 0) {
    return rule.available != null && rule.available < (rule.max ?? Number.POSITIVE_INFINITY)
      ? `Only ${formatQuantity(accepted, unit)} available.`
      : `The maximum per order is ${formatQuantity(accepted, unit)}.`;
  }
  return `Sold in multiples of ${rule.step}. We've set ${formatQuantity(accepted, unit)}.`;
}

/**
 * Quantity stepper that only ever produces valid quantities (BR-06, DESIGN_SYSTEM.md §9.3).
 * Typed values are applied on blur or Enter, and the reason for any adjustment is announced.
 */
export function QuantitySelector({
  value,
  onChange,
  rule,
  unit,
  label,
  labelHidden = false,
  compact = false,
  disabled = false,
  className,
}: {
  value: number;
  onChange: (quantity: number) => void;
  rule: QuantityRule;
  unit: SaleUnit;
  label?: string;
  /** Keep the label for screen readers only (e.g. cart lines, where the row names the item). */
  labelHidden?: boolean;
  /** Narrower input; the rule hint appears only when a limit is hit (cart lines). */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const decrement = stepQuantity(value, rule, -1);
  const increment = stepQuantity(value, rule, 1);
  const hint = message ?? (compact ? null : describeQuantityRule(rule, unit));

  function commit(raw: string) {
    setDraft(null);
    const requested = Number.parseInt(raw, 10);
    if (Number.isNaN(requested)) return;
    const accepted = clampQuantity(requested, rule);
    if (accepted === null) {
      setMessage("This item isn't available in any quantity right now.");
      return;
    }
    setMessage(accepted === requested ? null : limitMessage(requested, accepted, rule, unit));
    if (accepted !== value) onChange(accepted);
  }

  function step(next: number | null) {
    if (next === null) return;
    setMessage(null);
    onChange(next);
  }

  const buttonClass =
    "grid size-11 shrink-0 place-items-center rounded-full text-forest-900 transition-colors hover:bg-forest-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:text-ink-400";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={inputId}
        className={cn("text-sm font-medium text-ink-900", labelHidden && "sr-only")}
      >
        {label ?? `Quantity (${unitLabel(unit, 2)})`}
      </label>
      <div className="inline-flex w-fit items-center rounded-full border border-ink-400 bg-white [box-shadow:inset_0_1px_0_rgb(255_255_255/0.6),var(--shadow-xs)] focus-within:border-ring">
        <button
          type="button"
          className={buttonClass}
          aria-label="Decrease quantity"
          aria-controls={inputId}
          disabled={disabled || decrement === null}
          onClick={() => step(decrement)}
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          value={draft ?? String(value)}
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit(event.currentTarget.value);
          }}
          className={cn(
            "h-11 bg-transparent text-center text-base font-semibold text-ink-900 tabular-nums outline-none",
            compact ? "w-12" : "w-16",
          )}
        />
        <button
          type="button"
          className={buttonClass}
          aria-label="Increase quantity"
          aria-controls={inputId}
          disabled={disabled || increment === null}
          onClick={() => step(increment)}
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
      <p
        id={hintId}
        aria-live="polite"
        className={cn(
          "text-sm",
          !compact && "min-h-5",
          message ? "text-warning-fg" : "text-ink-600",
        )}
      >
        {hint}
      </p>
    </div>
  );
}
