import { describe, expect, it } from "vitest";

import type { OrderPaymentStatusView, PaymentAttemptStatus } from "@/types/domain";

import { paymentPollInterval } from "./queries";
import { formatCountdown } from "./use-now";

const start = Date.parse("2026-10-13T10:00:00Z");

function view(status: PaymentAttemptStatus | null): OrderPaymentStatusView {
  return {
    status: "pending",
    paymentStatus: status === "pending" ? "pending" : "unpaid",
    latestAttempt: status
      ? { id: "pay_1", status, resultMessage: null, at: new Date(start).toISOString() }
      : null,
    reservedUntil: null,
  };
}

describe("payment polling (ARCHITECTURE.md §7.2)", () => {
  it("polls every 3 s for 2 minutes, then every 15 s up to 10 minutes, then stops", () => {
    expect(paymentPollInterval(view("pending"), start + 5_000)).toBe(3_000);
    expect(paymentPollInterval(view("pending"), start + 119_000)).toBe(3_000);
    expect(paymentPollInterval(view("pending"), start + 121_000)).toBe(15_000);
    expect(paymentPollInterval(view("pending"), start + 599_000)).toBe(15_000);
    expect(paymentPollInterval(view("pending"), start + 601_000)).toBe(false);
  });

  it("doesn't poll without a pending attempt", () => {
    expect(paymentPollInterval(undefined)).toBe(false);
    expect(paymentPollInterval(view(null))).toBe(false);
    expect(paymentPollInterval(view("succeeded"))).toBe(false);
    expect(paymentPollInterval(view("cancelled"))).toBe(false);
  });
});

describe("formatCountdown", () => {
  it("shows minutes and seconds, rounding up and never below zero", () => {
    expect(formatCountdown(30 * 60_000)).toBe("30:00");
    expect(formatCountdown(65_500)).toBe("1:06");
    expect(formatCountdown(9_000)).toBe("0:09");
    expect(formatCountdown(-5_000)).toBe("0:00");
  });
});
