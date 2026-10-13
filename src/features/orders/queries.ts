import { queryOptions } from "@tanstack/react-query";

import { getServices } from "@/services";
import type { OrderPaymentStatusView, OrderRef } from "@/types/domain";

// Orders and payment status are always fresh (staleTime 0, ARCHITECTURE.md §7.2).

export const orderKeys = {
  all: () => ["orders"] as const,
  detail: (ref: OrderRef) => ["orders", "detail", ref.orderNumber, ref.token ?? null] as const,
  payment: (ref: OrderRef) => ["orders", "payment", ref.orderNumber, ref.token ?? null] as const,
};

/** How often to poll a pending M-Pesa attempt: 3 s for 2 min, then 15 s up to 10 min, then stop. */
export function paymentPollInterval(
  view: OrderPaymentStatusView | undefined,
  now: number = Date.now(),
): number | false {
  const attempt = view?.latestAttempt;
  if (attempt?.status !== "pending") return false;
  const elapsed = now - Date.parse(attempt.at);
  if (elapsed < 2 * 60_000) return 3_000;
  if (elapsed < 10 * 60_000) return 15_000;
  return false;
}

export const orderQueries = {
  detail: (ref: OrderRef) =>
    queryOptions({
      queryKey: orderKeys.detail(ref),
      queryFn: () => getServices().orders.getOrder(ref),
      staleTime: 0,
    }),
  payment: (ref: OrderRef) =>
    queryOptions({
      queryKey: orderKeys.payment(ref),
      queryFn: () => getServices().payments.getPaymentStatus(ref),
      staleTime: 0,
      refetchInterval: (query) => paymentPollInterval(query.state.data),
    }),
};
