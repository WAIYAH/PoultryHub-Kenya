import type { StatusTone } from "@/domain/order-status";
import { cn } from "@/lib/utils";

const TONES: Record<StatusTone, string> = {
  neutral: "bg-cream-100 text-ink-700",
  success: "bg-success-bg text-success-fg",
  warning: "bg-warning-bg text-warning-fg",
  danger: "bg-danger-bg text-danger",
  info: "bg-info-bg text-info-fg",
};

/** A customer-facing order or payment status (ORD-01, DESIGN_SYSTEM.md §9.3 OrderStatusBadge). */
export function OrderStatusBadge({
  label,
  tone,
  className,
}: {
  label: string;
  tone: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full px-3 text-sm font-semibold",
        TONES[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
