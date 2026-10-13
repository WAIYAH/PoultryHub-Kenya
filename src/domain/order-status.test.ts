import { describe, expect, it } from "vitest";

import type { OrderPaymentStatus, OrderStatus, PaymentMethod } from "@/types/domain";

import {
  isCustomerCancellable,
  normalizeOrderNumber,
  orderStatusLabel,
  paymentStatusLabel,
} from "./order-status";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "ready_for_collection",
  "dispatched",
  "completed",
  "cancelled",
];
const METHODS: PaymentMethod[] = [
  "mpesa_stk",
  "mpesa_paybill",
  "pay_on_delivery",
  "pay_on_collection",
];
const PAYMENT_STATUSES: OrderPaymentStatus[] = [
  "unpaid",
  "pending",
  "paid",
  "partially_refunded",
  "refunded",
];

const label = (
  status: OrderStatus,
  paymentMethod: PaymentMethod = "mpesa_stk",
  paymentStatus: OrderPaymentStatus = "unpaid",
  fulfilmentMethod: "delivery" | "collection" = "delivery",
) => orderStatusLabel({ status, paymentStatus, paymentMethod, fulfilmentMethod }).label;

describe("orderStatusLabel (ORD-01, DATABASE.md §5)", () => {
  it("has a label for every status, method and payment-status combination", () => {
    for (const status of STATUSES) {
      for (const method of METHODS) {
        for (const paymentStatus of PAYMENT_STATUSES) {
          expect(label(status, method, paymentStatus)).not.toBe("");
        }
      }
    }
  });

  it("separates M-Pesa orders awaiting payment from pay-later orders", () => {
    expect(label("pending", "mpesa_stk")).toBe("Awaiting payment");
    expect(label("pending", "pay_on_delivery")).toBe("Order received: we'll confirm shortly");
  });

  it("says whether a confirmed order is paid", () => {
    expect(label("confirmed", "mpesa_stk", "paid")).toBe("Payment confirmed");
    expect(label("confirmed", "pay_on_delivery", "unpaid")).toBe("Order confirmed");
  });

  it("uses delivered or picked up for completed orders", () => {
    expect(label("completed", "mpesa_stk", "paid", "delivery")).toBe("Delivered");
    expect(label("completed", "pay_on_collection", "paid", "collection")).toBe("Picked up");
  });

  it("mentions refunds on cancelled orders", () => {
    expect(label("cancelled")).toBe("Cancelled");
    expect(label("cancelled", "mpesa_stk", "refunded")).toBe("Cancelled: refunded");
  });

  it("labels every payment status", () => {
    for (const status of PAYMENT_STATUSES) expect(paymentStatusLabel(status).label).not.toBe("");
  });
});

describe("isCustomerCancellable (BR-25)", () => {
  it("allows cancelling only pending orders", () => {
    expect(STATUSES.filter(isCustomerCancellable)).toEqual(["pending"]);
  });
});

describe("normalizeOrderNumber (BR-27)", () => {
  it("accepts what customers type", () => {
    expect(normalizeOrderNumber("PH001234")).toBe("PH001234");
    expect(normalizeOrderNumber(" ph 001234 ")).toBe("PH001234");
    expect(normalizeOrderNumber("PH-001234")).toBe("PH001234");
  });

  it("rejects anything else", () => {
    expect(normalizeOrderNumber("001234")).toBeNull();
    expect(normalizeOrderNumber("PH12")).toBeNull();
    expect(normalizeOrderNumber("PH12345678901")).toBeNull(); // over 12 characters
  });
});
