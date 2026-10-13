import { formatKES } from "@/domain/money";
import { formatKenyanMobile, normalizeKenyanMobile } from "@/domain/phone";
import { siteSettings } from "@/mocks/fixtures/content";
import { AppError } from "@/lib/errors";
import { randomCode, randomId } from "@/lib/ids";
import type { MockPaymentOutcome, OrderEvent, PaymentAttemptStatus } from "@/types/domain";

import type { PaymentService } from "../contracts";

import { mockRequest } from "./latency";
import { findAccessibleOrder, settleOrders } from "./orders";
import { mutateState, type DemoOrder } from "./state";

// The mock payment provider (API_AND_INTEGRATIONS.md §8). It runs the M-Pesa flow entirely in the
// browser: nothing is charged, receipts start with "MOCK", and outcomes come from the TEST
// controls on the order page. Messages follow the result-code table in §7.5.

const OUTCOMES: Record<
  Exclude<MockPaymentOutcome, "success" | "late_success">,
  { status: PaymentAttemptStatus; message: string; label: string }
> = {
  cancelled: {
    status: "cancelled",
    message: "You cancelled the M-Pesa prompt. Try again when ready.",
    label: "M-Pesa prompt cancelled",
  },
  insufficient_funds: {
    status: "failed",
    message:
      "M-Pesa says the balance isn't enough. Top up and try again, or choose another method.",
    label: "M-Pesa payment failed: insufficient balance",
  },
  timeout: {
    status: "failed",
    message: "We couldn't reach your phone. Make sure it's on and unlocked, then try again.",
    label: "M-Pesa prompt not answered",
  },
};

function event(type: OrderEvent["type"], label: string, message?: string): OrderEvent {
  return { type, label, at: new Date().toISOString(), ...(message ? { message } : {}) };
}

function findPayment(orders: DemoOrder[], paymentId: string) {
  for (const order of orders) {
    const payment = order.payments.find((p) => p.id === paymentId);
    if (payment) return { order, payment };
  }
  return null;
}

export function createMockPaymentService(): PaymentService {
  return {
    async startMpesaPayment(input) {
      await mockRequest();
      if (!siteSettings.payments.mpesaStk) throw new AppError("PAYMENTS_DISABLED");
      const phone = normalizeKenyanMobile(input.phone);
      if (!phone) throw new AppError("INVALID_PHONE");

      return mutateState((state) => {
        settleOrders(state);
        const order = findAccessibleOrder(state, input);
        if (!order) throw new AppError("NOT_FOUND");
        if (order.status !== "pending" || order.paymentStatus === "paid") {
          throw new AppError("ORDER_NOT_PAYABLE");
        }
        // BR-19: one attempt in progress per order; asking again returns it.
        const inFlight = order.payments.find((p) => p.status === "pending");
        if (inFlight) {
          return {
            id: inFlight.id,
            status: inFlight.status,
            customerMessage: "Check your phone: we've already sent a prompt.",
          };
        }
        const payment = {
          id: `pay_${randomId()}`,
          status: "pending" as const,
          method: "mpesa_stk" as const,
          amountMinor: order.totalMinor, // always the server's total (PAY-01)
          phone,
          receipt: null,
          resultMessage: null,
          at: new Date().toISOString(),
        };
        order.payments.push(payment);
        order.paymentStatus = "pending";
        order.events.push(
          event("payment_initiated", `M-Pesa prompt sent to ${formatKenyanMobile(phone)}`),
        );
        return {
          id: payment.id,
          status: payment.status,
          customerMessage: `Check your phone: enter your M-Pesa PIN to pay ${formatKES(order.totalMinor)}.`,
        };
      });
    },

    async getPaymentStatus(ref) {
      await mockRequest();
      return mutateState((state) => {
        settleOrders(state);
        const order = findAccessibleOrder(state, ref);
        if (!order) throw new AppError("NOT_FOUND");
        const latest = order.payments.at(-1);
        return {
          status: order.status,
          paymentStatus: order.paymentStatus,
          latestAttempt: latest
            ? {
                id: latest.id,
                status: latest.status,
                resultMessage: latest.resultMessage,
                at: latest.at,
              }
            : null,
          reservedUntil: order.status === "pending" ? order.reservedUntil : null,
        };
      });
    },

    async submitPaybillReference({ reference, ...ref }) {
      await mockRequest();
      const code = reference.trim().toUpperCase();
      if (!/^[A-Z0-9]{8,12}$/.test(code)) {
        throw new AppError(
          "VALIDATION_FAILED",
          "Enter the M-Pesa code from your SMS, e.g. SJK7XYZ123.",
          {
            fields: { reference: "Enter the 10-character M-Pesa code." },
          },
        );
      }
      mutateState((state) => {
        const order = findAccessibleOrder(state, ref);
        if (!order) throw new AppError("NOT_FOUND");
        if (order.paymentStatus === "paid") throw new AppError("ORDER_NOT_PAYABLE");
        // Staff verify it against the M-Pesa statement (PAY-03); it never marks the order paid.
        order.events.push(
          event(
            "note",
            `M-Pesa code ${code} received`,
            "We'll confirm it against our M-Pesa statement.",
          ),
        );
      });
    },

    async simulate({ paymentId, outcome }) {
      await mockRequest();
      mutateState((state) => {
        const found = findPayment(state.orders, paymentId);
        if (!found) throw new AppError("NOT_FOUND");
        const { order, payment } = found;
        if (payment.status !== "pending") return; // final already: duplicate callbacks are no-ops

        if (outcome === "success" || outcome === "late_success") {
          if (outcome === "late_success" && order.status === "pending") {
            // The hold expired before the money arrived (AC-5).
            order.status = "cancelled";
            order.events.push(
              event(
                "status_changed",
                "Cancelled: payment not received",
                "The payment window closed, so the items went back on sale.",
              ),
            );
          }
          payment.status = "succeeded";
          payment.receipt = `MOCK${randomCode(6)}`;
          payment.resultMessage = "Payment received. Thank you!";
          order.paymentStatus = "paid";
          order.events.push(
            event(
              "payment_succeeded",
              `Payment received: ${formatKES(payment.amountMinor)} (M-Pesa ${payment.receipt})`,
            ),
          );
          if (order.status === "pending") {
            order.status = "confirmed";
            order.events.push(event("status_changed", "Payment confirmed"));
          } else {
            // BR-21: never applied silently to a cancelled order; an admin reviews it.
            order.needsReview = true;
            order.events.push(
              event(
                "note",
                "Payment received after cancellation",
                "We'll contact you to either reinstate your order or refund you.",
              ),
            );
          }
          return;
        }

        const result = OUTCOMES[outcome];
        payment.status = result.status;
        payment.resultMessage = result.message;
        if (order.paymentStatus === "pending") order.paymentStatus = "unpaid";
        order.events.push(event("payment_failed", result.label));
      });
    },
  };
}
