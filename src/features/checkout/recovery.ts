import { clampQuantity } from "@/domain/units";
import { errorMessage, isAppError, type AppError } from "@/lib/errors";
import type { CartQuote, SaleUnit } from "@/types/domain";

import { serverFieldErrors, type CheckoutField } from "./checkout-form";

// What the checkout does when the server turns an order down (CHK-05). The four outcomes that
// need a decision get their own screen; field problems go back to the form; the rest are an
// alert next to the button.

export type CheckoutProblem =
  | { kind: "fields"; fields: Partial<Record<CheckoutField, string>> }
  | { kind: "price_changed"; quote: CartQuote }
  | { kind: "stock"; quote: CartQuote }
  | { kind: "area_not_served" }
  | { kind: "too_many_open_orders" }
  | { kind: "promo"; message: string }
  | { kind: "minimum_order"; message: string }
  | { kind: "alert"; message: string };

function quoteFrom(error: AppError): CartQuote | null {
  const quote = error.details?.quote;
  return typeof quote === "object" && quote !== null ? (quote as CartQuote) : null;
}

export function classifyPlaceOrderError(error: unknown): CheckoutProblem {
  if (!isAppError(error)) return { kind: "alert", message: errorMessage(error) };
  const quote = quoteFrom(error);
  switch (error.code) {
    case "VALIDATION_FAILED": {
      const fields = serverFieldErrors(error.details?.fields);
      return Object.keys(fields).length > 0
        ? { kind: "fields", fields }
        : { kind: "alert", message: error.message };
    }
    case "PAYMENT_METHOD_UNAVAILABLE":
      return { kind: "fields", fields: { paymentMethod: error.message } };
    case "PRICE_CHANGED":
      return quote ? { kind: "price_changed", quote } : { kind: "alert", message: error.message };
    case "INSUFFICIENT_STOCK":
    case "QUANTITY_RULE":
      return quote ? { kind: "stock", quote } : { kind: "alert", message: error.message };
    case "AREA_NOT_SERVED":
      return { kind: "area_not_served" };
    case "TOO_MANY_OPEN_ORDERS":
      return { kind: "too_many_open_orders" };
    case "PROMO_INVALID":
      return { kind: "promo", message: error.message };
    case "BELOW_MINIMUM_ORDER":
      return { kind: "minimum_order", message: error.message };
    default:
      return { kind: "alert", message: error.message };
  }
}

/**
 * Whether the next attempt needs a new idempotency key. A definite "no" from the server created
 * no order, so the corrected order is a new request. After a network error or an unknown failure
 * the order may exist: the same key makes the retry return it instead of placing it twice
 * (NFR-REL-1).
 */
export function needsNewIdempotencyKey(error: unknown): boolean {
  return isAppError(error) && !error.retryable;
}

export interface StockFix {
  variantId: string;
  name: string;
  unit: SaleUnit;
  from: number;
  /** The quantity that can still be ordered, or null when the item must be removed. */
  to: number | null;
}

/** One fix per line the server rejected for stock or quantity rules (BR-06, BR-11). */
export function stockFixes(quote: CartQuote): StockFix[] {
  return quote.lines.flatMap((line): StockFix[] => {
    const codes = new Set(line.issues.map((issue) => issue.code));
    if (
      !codes.has("INSUFFICIENT_STOCK") &&
      !codes.has("QUANTITY_RULE") &&
      !codes.has("UNAVAILABLE")
    )
      return [];
    return [
      {
        variantId: line.variantId,
        name: `${line.productName} (${line.variantName})`,
        unit: line.unit,
        from: line.quantity,
        to: codes.has("UNAVAILABLE") ? null : clampQuantity(line.quantity, line.rule),
      },
    ];
  });
}

export interface PriceChange {
  variantId: string;
  name: string;
  unit: SaleUnit;
  fromMinor: number;
  toMinor: number;
}

/** Lines whose unit price differs between the quote the customer saw and the server's new one. */
export function priceChanges(previous: CartQuote | undefined, next: CartQuote): PriceChange[] {
  if (!previous) return [];
  return next.lines.flatMap((line): PriceChange[] => {
    const before = previous.lines.find((p) => p.variantId === line.variantId);
    if (!before || before.unitPriceMinor === line.unitPriceMinor) return [];
    return [
      {
        variantId: line.variantId,
        name: `${line.productName} (${line.variantName})`,
        unit: line.unit,
        fromMinor: before.unitPriceMinor,
        toMinor: line.unitPriceMinor,
      },
    ];
  });
}
