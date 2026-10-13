import type { FulfilmentMethod, MinorUnits, PaymentMethod, SiteSettings } from "@/types/domain";

// Which payment methods an order may use (REQUIREMENTS.md BR-17, CHK-04). The server enforces the
// same rules; the checkout uses this to offer only valid choices.

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, { title: string; description: string }> =
  {
    mpesa_stk: {
      title: "Pay with M-Pesa",
      description: "We'll send a payment prompt to your phone. Enter your M-Pesa PIN to pay.",
    },
    mpesa_paybill: {
      title: "M-Pesa Paybill",
      description: "Pay from your M-Pesa menu using our Paybill and your order number.",
    },
    pay_on_delivery: {
      title: "Pay on delivery",
      description: "Pay the rider by M-Pesa or cash when your order arrives.",
    },
    pay_on_collection: {
      title: "Pay at pick-up",
      description: "Pay by M-Pesa or cash when you collect your order.",
    },
  };

export type PaymentSettings = SiteSettings["payments"];

export type PaymentMethodAvailability =
  | { method: PaymentMethod; available: true }
  | {
      method: PaymentMethod;
      available: false;
      reason: "disabled" | "needs_delivery" | "needs_collection" | "over_limit";
    };

const ORDER: PaymentMethod[] = [
  "mpesa_stk",
  "pay_on_delivery",
  "pay_on_collection",
  "mpesa_paybill",
];

function enabled(settings: PaymentSettings, method: PaymentMethod): boolean {
  switch (method) {
    case "mpesa_stk":
      return settings.mpesaStk;
    case "mpesa_paybill":
      return settings.mpesaPaybill;
    case "pay_on_delivery":
      return settings.payOnDelivery;
    case "pay_on_collection":
      return settings.payOnCollection;
  }
}

/** Every method with whether it can be used for this order, and why not (BR-17). */
export function paymentMethodAvailability(
  settings: PaymentSettings,
  fulfilment: FulfilmentMethod,
  totalMinor: MinorUnits | null,
): PaymentMethodAvailability[] {
  return ORDER.map((method): PaymentMethodAvailability => {
    if (!enabled(settings, method)) return { method, available: false, reason: "disabled" };
    if (method === "pay_on_delivery") {
      if (fulfilment !== "delivery") return { method, available: false, reason: "needs_delivery" };
      if (
        settings.payOnDeliveryMaxMinor !== null &&
        totalMinor !== null &&
        totalMinor > settings.payOnDeliveryMaxMinor
      ) {
        return { method, available: false, reason: "over_limit" };
      }
    }
    if (method === "pay_on_collection" && fulfilment !== "collection") {
      return { method, available: false, reason: "needs_collection" };
    }
    return { method, available: true };
  });
}

export function isPaymentMethodAllowed(
  settings: PaymentSettings,
  method: PaymentMethod,
  fulfilment: FulfilmentMethod,
  totalMinor: MinorUnits,
): boolean {
  return paymentMethodAvailability(settings, fulfilment, totalMinor).some(
    (option) => option.method === method && option.available,
  );
}
