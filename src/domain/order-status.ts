import type {
  FulfilmentMethod,
  OrderPaymentStatus,
  OrderStatus,
  PaymentMethod,
} from "@/types/domain";

// Customer-facing order labels (REQUIREMENTS.md ORD-01, DATABASE.md §5).

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface OrderStatusLabel {
  label: string;
  tone: StatusTone;
}

const PAY_LATER: ReadonlySet<PaymentMethod> = new Set([
  "pay_on_delivery",
  "pay_on_collection",
  "mpesa_paybill",
]);

export function orderStatusLabel(order: {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  fulfilmentMethod: FulfilmentMethod;
}): OrderStatusLabel {
  const paid = order.paymentStatus === "paid" || order.paymentStatus === "partially_refunded";
  switch (order.status) {
    case "pending":
      return PAY_LATER.has(order.paymentMethod)
        ? { label: "Order received: we'll confirm shortly", tone: "warning" }
        : { label: "Awaiting payment", tone: "warning" };
    case "confirmed":
      return paid
        ? { label: "Payment confirmed", tone: "success" }
        : { label: "Order confirmed", tone: "info" };
    case "processing":
      return { label: "Being prepared", tone: "info" };
    case "ready_for_collection":
      return { label: "Ready for pick-up", tone: "success" };
    case "dispatched":
      return { label: "Out for delivery", tone: "info" };
    case "completed":
      return {
        label: order.fulfilmentMethod === "collection" ? "Picked up" : "Delivered",
        tone: "success",
      };
    case "cancelled":
      return {
        label: order.paymentStatus === "refunded" ? "Cancelled: refunded" : "Cancelled",
        tone: "danger",
      };
  }
}

const PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, OrderStatusLabel> = {
  unpaid: { label: "Not paid", tone: "neutral" },
  pending: { label: "Payment in progress", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  partially_refunded: { label: "Partly refunded", tone: "info" },
  refunded: { label: "Refunded", tone: "info" },
};

export function paymentStatusLabel(status: OrderPaymentStatus): OrderStatusLabel {
  return PAYMENT_STATUS_LABELS[status];
}

/** BR-25: customers may cancel only while the order is still pending. */
export function isCustomerCancellable(status: OrderStatus): boolean {
  return status === "pending";
}

/** Order numbers: "PH" + at least 6 digits, at most 12 characters (BR-27). */
export const ORDER_NUMBER_PATTERN = /^PH\d{6,10}$/;

/** Normalises what a customer types ("ph 001234", "PH-001234") into "PH001234", or null. */
export function normalizeOrderNumber(input: string): string | null {
  const compact = input.trim().toUpperCase().replace(/[\s-]/g, "");
  return ORDER_NUMBER_PATTERN.test(compact) ? compact : null;
}
