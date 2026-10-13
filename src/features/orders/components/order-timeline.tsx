import { formatDateTime } from "@/domain/dates";
import { cn } from "@/lib/utils";
import type { OrderEvent } from "@/types/domain";

/** What has happened to the order, oldest first, newest highlighted (ORD-01). */
export function OrderTimeline({
  events,
  className,
}: {
  events: Pick<OrderEvent, "label" | "at" | "message">[];
  className?: string;
}) {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <ol className={cn("flex flex-col", className)} data-testid="order-timeline">
      {sorted.map((event, index) => {
        const latest = index === sorted.length - 1;
        return (
          <li key={`${event.at}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {latest ? null : (
              <span aria-hidden="true" className="absolute top-4 left-[5px] h-full w-px bg-line" />
            )}
            <span
              aria-hidden="true"
              className={cn(
                "relative mt-1.5 size-[11px] shrink-0 rounded-full",
                latest ? "bg-forest-700 ring-4 ring-forest-100" : "bg-forest-300",
              )}
            />
            <div className="flex flex-col gap-0.5">
              <p className={cn("text-sm", latest ? "font-semibold text-ink-900" : "text-ink-700")}>
                {event.label}
              </p>
              {event.message ? <p className="text-sm text-ink-600">{event.message}</p> : null}
              <p className="text-xs text-ink-600">
                <time dateTime={event.at}>{formatDateTime(event.at)}</time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
