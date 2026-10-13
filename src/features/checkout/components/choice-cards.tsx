import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { fieldId, type CheckoutField } from "../checkout-form";

/**
 * A group of radio cards (DESIGN_SYSTEM.md §9.3 FulfilmentOptions, PaymentMethodOptions). Native
 * radios inside a fieldset: arrow keys move between options and screen readers announce the group.
 */
export function ChoiceGroup({
  name,
  legend,
  error,
  hideLegend = false,
  children,
  className,
}: {
  name: CheckoutField;
  legend: string;
  error?: string;
  hideLegend?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const id = fieldId(name);
  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn("flex flex-col gap-3 outline-none", className)}
    >
      <legend className={hideLegend ? "sr-only" : "mb-3 text-sm font-medium text-ink-900"}>
        {legend}
      </legend>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** One radio card: a title, an optional description and extra detail. */
export function ChoiceCard({
  title,
  description,
  aside,
  disabledReason,
  className,
  ...radio
}: Omit<ComponentProps<"input">, "type" | "className" | "title"> & {
  title: ReactNode;
  description?: ReactNode;
  /** Shown at the right of the title, e.g. a fee. */
  aside?: ReactNode;
  /** Why the option can't be chosen; shown under it. */
  disabledReason?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-4 transition-colors",
        "hover:border-forest-300 has-checked:border-forest-700 has-checked:bg-forest-50 has-checked:ring-1 has-checked:ring-forest-700",
        "has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2",
        "has-disabled:cursor-not-allowed has-disabled:bg-cream-50 has-disabled:hover:border-line",
        className,
      )}
    >
      <input
        type="radio"
        className="mt-0.5 size-5 shrink-0 cursor-pointer accent-forest-700 outline-none disabled:cursor-not-allowed"
        {...radio}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-semibold text-ink-900">{title}</span>
          {aside ? <span className="text-sm font-semibold text-ink-900">{aside}</span> : null}
        </span>
        {description ? <span className="text-sm text-ink-700">{description}</span> : null}
        {disabledReason ? (
          <span className="text-sm font-medium text-warning-fg">{disabledReason}</span>
        ) : null}
      </span>
    </label>
  );
}
