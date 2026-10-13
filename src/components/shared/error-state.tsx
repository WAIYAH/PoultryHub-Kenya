import { CloudOff, RotateCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Load failure with a retry (DESIGN_SYSTEM.md §11). `fallback` is typically a WhatsApp link so
 * customers can still order when the network or the data source is down (NFR-REL-3).
 */
export function ErrorState({
  title = "We couldn't load this",
  description = "Check your connection and try again.",
  onRetry,
  retrying = false,
  fallback,
  className,
}: {
  title?: string;
  description?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  fallback?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center gap-4 rounded-lg bg-white px-6 py-12 text-center shadow-card",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-danger-bg text-danger">
        <CloudOff aria-hidden="true" className="size-6" strokeWidth={1.75} />
      </span>
      <div className="flex max-w-md flex-col gap-2">
        <h2 className="text-h3 text-ink-900">{title}</h2>
        <p className="text-ink-600">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry ? (
          <Button onClick={onRetry} loading={retrying}>
            {retrying ? null : <RotateCw aria-hidden="true" />}
            Try again
          </Button>
        ) : null}
        {fallback}
      </div>
    </div>
  );
}
