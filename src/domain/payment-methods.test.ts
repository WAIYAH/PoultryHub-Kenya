import { describe, expect, it } from "vitest";

import {
  acceptedPaymentsSentence,
  isPaymentMethodAllowed,
  paymentMethodAvailability,
  type PaymentSettings,
} from "./payment-methods";

const settings: PaymentSettings = {
  mpesaStk: true,
  mpesaPaybill: true,
  payOnDelivery: true,
  payOnCollection: true,
  paybillDisplay: null,
  payOnDeliveryMaxMinor: 1_000_000,
};

const available = (s: PaymentSettings, fulfilment: "delivery" | "collection", total: number) =>
  paymentMethodAvailability(s, fulfilment, total)
    .filter((option) => option.available)
    .map((option) => option.method);

describe("payment method rules (BR-17, CHK-04)", () => {
  it("offers pay on delivery only with delivery", () => {
    expect(available(settings, "delivery", 50_000)).toContain("pay_on_delivery");
    expect(available(settings, "collection", 50_000)).not.toContain("pay_on_delivery");
  });

  it("offers pay at pick-up only with pick-up", () => {
    expect(available(settings, "collection", 50_000)).toContain("pay_on_collection");
    expect(available(settings, "delivery", 50_000)).not.toContain("pay_on_collection");
  });

  it("respects the pay-on-delivery maximum", () => {
    expect(isPaymentMethodAllowed(settings, "pay_on_delivery", "delivery", 1_000_000)).toBe(true);
    expect(isPaymentMethodAllowed(settings, "pay_on_delivery", "delivery", 1_000_100)).toBe(false);
    const reason = paymentMethodAvailability(settings, "delivery", 2_000_000).find(
      (option) => option.method === "pay_on_delivery",
    );
    expect(reason).toEqual({ method: "pay_on_delivery", available: false, reason: "over_limit" });
  });

  it("never offers a method switched off in settings", () => {
    const off = { ...settings, mpesaStk: false };
    expect(available(off, "delivery", 50_000)).not.toContain("mpesa_stk");
  });

  it("describes the accepted methods for the footer (SITE-07)", () => {
    expect(acceptedPaymentsSentence(settings)).toBe(
      "We accept M-Pesa, pay on delivery and pay at pick-up.",
    );
    expect(
      acceptedPaymentsSentence({ ...settings, payOnDelivery: false, payOnCollection: false }),
    ).toBe("We accept M-Pesa.");
    expect(
      acceptedPaymentsSentence({
        ...settings,
        mpesaStk: false,
        mpesaPaybill: false,
        payOnDelivery: false,
        payOnCollection: false,
      }),
    ).toBeNull();
  });

  it("lists M-Pesa first", () => {
    expect(available(settings, "delivery", 50_000)[0]).toBe("mpesa_stk");
  });
});
