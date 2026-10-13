import { EMPTY_CHECKOUT, type CheckoutValues } from "./checkout-form";

// The checkout draft (CHK-03, ARCHITECTURE.md §7.3): what the customer typed, kept in
// sessionStorage so a refresh on a flaky network loses nothing, and cleared once the order is
// placed. It also keeps the idempotency key of an attempt whose outcome is unknown, so retrying
// after a reload returns the same order instead of placing a second one.

export const CHECKOUT_DRAFT_KEY = "phk-checkout-draft";

export interface CheckoutDraft {
  values: CheckoutValues;
  idempotencyKey: string | null;
}

const PAYMENT_METHODS = new Set([
  "mpesa_stk",
  "mpesa_paybill",
  "pay_on_delivery",
  "pay_on_collection",
]);

/** Keeps only known string fields with valid values, so an old or edited draft can't break the form. */
function sanitize(raw: unknown): CheckoutValues {
  const values = { ...EMPTY_CHECKOUT };
  if (typeof raw !== "object" || raw === null) return values;
  const source = raw as Record<string, unknown>;
  for (const key of Object.keys(values) as (keyof CheckoutValues)[]) {
    const value = source[key];
    if (typeof value !== "string") continue;
    if (key === "fulfilment") {
      if (value === "delivery" || value === "collection") values.fulfilment = value;
    } else if (key === "paymentMethod") {
      if (PAYMENT_METHODS.has(value))
        values.paymentMethod = value as CheckoutValues["paymentMethod"];
    } else {
      values[key] = value;
    }
  }
  return values;
}

export function readCheckoutDraft(): CheckoutDraft {
  try {
    const stored = window.sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { values?: unknown; idempotencyKey?: unknown };
      return {
        values: sanitize(parsed.values),
        idempotencyKey: typeof parsed.idempotencyKey === "string" ? parsed.idempotencyKey : null,
      };
    }
  } catch {
    // Storage blocked or the draft is unreadable: start empty.
  }
  return { values: { ...EMPTY_CHECKOUT }, idempotencyKey: null };
}

export function writeCheckoutDraft(draft: CheckoutDraft): void {
  try {
    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked: the form still works, only without the draft.
  }
}

export function clearCheckoutDraft(): void {
  try {
    window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
  } catch {
    // Nothing to clear.
  }
}
