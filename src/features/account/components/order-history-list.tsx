import { ChevronRight } from "lucide-react";
import { Link } from "react-router";

import { formatDate } from "@/domain/dates";
import { formatKES } from "@/domain/money";
import { orderStatusLabel } from "@/domain/order-status";
import { OrderStatusBadge } from "@/features/orders";
import type { OrderSummary } from "@/types/domain";

function itemsText(order: OrderSummary): string {
  const shown = order.previewNames.join(", ");
  const more = order.itemCount - order.previewNames.length;
  return more > 0 ? `${shown} and ${more} more` : shown;
}

/** The customer's orders, newest first (ORD-03, ACC-06); each opens its order page. */
export function OrderHistoryList({ orders }: { orders: OrderSummary[] }) {
  return (
    <ul
      className="flex flex-col divide-y divide-line rounded-lg bg-white shadow-card"
      data-testid="order-history"
    >
      {orders.map((order) => {
        const status = orderStatusLabel(order);
        return (
          <li key={order.orderNumber}>
            <Link
              to={`/orders/${order.orderNumber}`}
              className="flex items-center gap-3 p-4 hover:bg-forest-50 sm:p-5"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-mono font-semibold tracking-wide text-ink-900">
                    {order.orderNumber}
                  </span>
                  <OrderStatusBadge label={status.label} tone={status.tone} />
                </div>
                <p className="line-clamp-1 text-sm text-ink-700">{itemsText(order)}</p>
                <p className="text-sm text-ink-600">
                  <time dateTime={order.placedAt}>{formatDate(order.placedAt)}</time> ·{" "}
                  <span className="font-semibold text-ink-900" data-tabular>
                    {formatKES(order.totalMinor)}
                  </span>
                </p>
              </div>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-ink-600" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
