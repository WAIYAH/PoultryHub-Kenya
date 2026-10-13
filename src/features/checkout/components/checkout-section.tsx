import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A numbered checkout step (DESIGN_SYSTEM.md §9.3 CheckoutSection). */
export function CheckoutSection({
  id,
  step,
  title,
  description,
  children,
  className,
}: {
  id: string;
  step: number;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={cn("scroll-mt-6 rounded-lg bg-white p-5 shadow-card sm:p-6", className)}
    >
      <div className="mb-5 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-900 text-sm font-bold text-white"
        >
          {step}
        </span>
        <div className="flex flex-col gap-1 pt-0.5">
          <h2 id={`${id}-heading`} className="text-h3 text-ink-900">
            <span className="sr-only">Step {step}: </span>
            {title}
          </h2>
          {description ? <p className="text-sm text-ink-700">{description}</p> : null}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
