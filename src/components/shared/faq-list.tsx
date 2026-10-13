import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Faq } from "@/types/domain";

/**
 * FAQ accordion (CNT-04) built on native <details>: keyboard and screen-reader support come from
 * the browser, it works before hydration and without JavaScript, and it costs no JS at all.
 * Answers are plain text; blank lines separate paragraphs.
 */
export function FaqList({ faqs, className }: { faqs: Faq[]; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {faqs.map((faq) => (
        <details
          key={faq.id}
          id={faq.id}
          className="group rounded-lg bg-white shadow-card open:shadow-raised"
          data-testid="faq-item"
        >
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-lg px-5 py-4 font-semibold text-ink-900 marker:hidden hover:text-forest-800 [&::-webkit-details-marker]:hidden">
            {faq.question}
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-forest-50 text-forest-800 transition-transform duration-200 group-open:rotate-180">
              <ChevronDown aria-hidden="true" className="size-4" />
            </span>
          </summary>
          <div className="flex flex-col gap-3 px-5 pb-5 text-ink-700">
            {faq.answer.split(/\n{2,}/).map((paragraph) => (
              <p key={paragraph} className="max-w-prose">
                {paragraph}
              </p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
