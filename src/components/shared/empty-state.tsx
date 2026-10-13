import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Empty results or lists (DESIGN_SYSTEM.md §11): what happened, and what to do next. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actions,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg bg-white px-6 py-12 text-center shadow-card",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-forest-100 text-forest-800">
        <Icon aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-h3 text-ink-900">{title}</h2>
        {description ? <p className="text-ink-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
