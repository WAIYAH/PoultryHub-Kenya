import { CircleAlert } from "lucide-react";
import { useEffect, useRef, type MouseEvent } from "react";

import { FIELD_LABELS, fieldId, type CheckoutField } from "../checkout-form";

/**
 * "Please fix 2 fields: Phone number, Area." (CHK-03, DESIGN_SYSTEM.md §11). It lists the fields
 * that still have errors, so it shrinks as they're fixed, and takes focus on each failed attempt
 * (`focusKey` changes) so screen readers announce it. Each item moves focus to its field.
 */
export function ErrorSummary({ fields, focusKey }: { fields: CheckoutField[]; focusKey: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const focusedFor = useRef(0);

  // Once per attempt, as soon as the summary is on screen: the form's errors can arrive a render
  // after the attempt is counted.
  useEffect(() => {
    if (focusKey > focusedFor.current && ref.current) {
      focusedFor.current = focusKey;
      ref.current.focus();
    }
  });

  if (fields.length === 0) return null;

  function focusField(event: MouseEvent<HTMLAnchorElement>, field: CheckoutField) {
    const target = document.getElementById(fieldId(field));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ block: "center" });
    // A group (radio cards) focuses its first enabled option.
    const focusable =
      target instanceof HTMLFieldSetElement
        ? target.querySelector<HTMLInputElement>("input:not(:disabled)")
        : target;
    focusable?.focus({ preventScroll: true });
  }

  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-labelledby="checkout-error-summary-title"
      data-testid="checkout-error-summary"
      className="flex flex-col gap-2 rounded-lg border border-danger/30 bg-danger-bg p-4 text-sm text-danger outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p id="checkout-error-summary-title" className="flex items-center gap-2 font-semibold">
        <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
        Please fix {fields.length === 1 ? "1 field" : `${fields.length} fields`}:
      </p>
      <ul className="flex flex-col gap-1 pl-7">
        {fields.map((field) => (
          <li key={field}>
            <a
              href={`#${fieldId(field)}`}
              onClick={(event) => focusField(event, field)}
              className="underline underline-offset-4"
            >
              {FIELD_LABELS[field]}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
