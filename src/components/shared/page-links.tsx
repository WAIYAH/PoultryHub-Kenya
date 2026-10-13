import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

/** Page numbers to show: first, last, and up to two either side of the current page. */
export function pageWindow(page: number, pageCount: number): (number | "gap")[] {
  const pages = new Set([1, pageCount, page - 2, page - 1, page, page + 1, page + 2]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const result: (number | "gap")[] = [];
  sorted.forEach((p, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && p - previous > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const item =
  "inline-flex min-w-11 h-11 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors";

/** Numbered pagination with real links, so every page has a shareable URL (CAT-03). */
export function PageLinks({
  page,
  pageCount,
  hrefFor,
  label = "Pages",
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  label?: string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label={label} className="flex justify-center">
      <ul className="flex flex-wrap items-center gap-1">
        <li>
          {page > 1 ? (
            <Link to={hrefFor(page - 1)} className={cn(item, "text-forest-900 hover:bg-forest-50")}>
              <ChevronLeft aria-hidden="true" className="size-4" />
              <span className="sr-only sm:not-sr-only sm:ml-1">Previous</span>
            </Link>
          ) : null}
        </li>
        {pageWindow(page, pageCount).map((p, index) =>
          p === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-600">
              …
            </li>
          ) : (
            <li key={p}>
              <Link
                to={hrefFor(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  item,
                  p === page ? "bg-forest-900 text-white" : "text-ink-900 hover:bg-forest-50",
                )}
              >
                {p}
              </Link>
            </li>
          ),
        )}
        <li>
          {page < pageCount ? (
            <Link to={hrefFor(page + 1)} className={cn(item, "text-forest-900 hover:bg-forest-50")}>
              <span className="sr-only sm:not-sr-only sm:mr-1">Next</span>
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}
