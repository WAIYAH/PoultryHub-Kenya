import { describe, expect, it } from "vitest";

import { AppError } from "@/lib/errors";
import type { CartQuote, QuoteLine } from "@/types/domain";

import {
  classifyPlaceOrderError,
  needsNewIdempotencyKey,
  priceChanges,
  stockFixes,
} from "./recovery";

function line(overrides: Partial<QuoteLine> = {}): QuoteLine {
  return {
    variantId: "v-eggs",
    productSlug: "farm-fresh-eggs",
    productName: "Farm fresh eggs",
    variantName: "Tray of 30",
    unit: "tray",
    unitPriceMinor: 55_000,
    quantity: 4,
    lineTotalMinor: 220_000,
    image: null,
    rule: { min: 1, step: 1, max: 50, available: 120 },
    collectionOnly: false,
    issues: [],
    ...overrides,
  };
}

function quote(lines: QuoteLine[]): CartQuote {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotalMinor, 0);
  return {
    lines,
    subtotalMinor: subtotal,
    discountMinor: 0,
    deliveryFeeMinor: 0,
    totalMinor: subtotal,
    delivery: null,
    promo: null,
    issues: [],
  };
}

describe("classifyPlaceOrderError (CHK-05)", () => {
  const fresh = quote([line()]);

  it("gives the four decision outcomes their own screens", () => {
    expect(
      classifyPlaceOrderError(new AppError("PRICE_CHANGED", undefined, { quote: fresh })),
    ).toEqual({ kind: "price_changed", quote: fresh });
    expect(
      classifyPlaceOrderError(new AppError("INSUFFICIENT_STOCK", undefined, { quote: fresh })),
    ).toEqual({ kind: "stock", quote: fresh });
    expect(
      classifyPlaceOrderError(new AppError("QUANTITY_RULE", undefined, { quote: fresh })),
    ).toEqual({ kind: "stock", quote: fresh });
    expect(classifyPlaceOrderError(new AppError("AREA_NOT_SERVED"))).toEqual({
      kind: "area_not_served",
    });
    expect(classifyPlaceOrderError(new AppError("TOO_MANY_OPEN_ORDERS"))).toEqual({
      kind: "too_many_open_orders",
    });
  });

  it("sends field problems back to the form", () => {
    expect(
      classifyPlaceOrderError(
        new AppError("VALIDATION_FAILED", undefined, {
          fields: { "customer.name": "Enter your name." },
        }),
      ),
    ).toEqual({ kind: "fields", fields: { name: "Enter your name." } });
    expect(classifyPlaceOrderError(new AppError("PAYMENT_METHOD_UNAVAILABLE"))).toEqual({
      kind: "fields",
      fields: { paymentMethod: "That payment method isn't available for this order." },
    });
  });

  it("keeps the server's wording for promo and minimum-order problems", () => {
    expect(
      classifyPlaceOrderError(new AppError("PROMO_INVALID", "This code has expired.")),
    ).toEqual({ kind: "promo", message: "This code has expired." });
    expect(
      classifyPlaceOrderError(new AppError("BELOW_MINIMUM_ORDER", "Minimum KSh 1,000.")),
    ).toEqual({ kind: "minimum_order", message: "Minimum KSh 1,000." });
  });

  it("falls back to an alert, including for unknown errors and a missing quote", () => {
    expect(classifyPlaceOrderError(new AppError("NETWORK"))).toMatchObject({ kind: "alert" });
    expect(classifyPlaceOrderError(new AppError("PRICE_CHANGED"))).toMatchObject({ kind: "alert" });
    expect(classifyPlaceOrderError(new Error("boom"))).toMatchObject({ kind: "alert" });
  });
});

describe("needsNewIdempotencyKey (NFR-REL-1)", () => {
  it("keeps the key when the order may exist, so a retry returns it", () => {
    expect(needsNewIdempotencyKey(new AppError("NETWORK"))).toBe(false);
    expect(needsNewIdempotencyKey(new AppError("INTERNAL"))).toBe(false);
    expect(needsNewIdempotencyKey(new TypeError("Failed to fetch"))).toBe(false);
  });

  it("starts a new request after a definite rejection", () => {
    expect(needsNewIdempotencyKey(new AppError("PRICE_CHANGED"))).toBe(true);
    expect(needsNewIdempotencyKey(new AppError("VALIDATION_FAILED"))).toBe(true);
  });
});

describe("stockFixes", () => {
  it("lowers a quantity to what's left, or removes the item", () => {
    const fixes = stockFixes(
      quote([
        line({
          variantId: "a",
          quantity: 10,
          rule: { min: 1, step: 1, max: null, available: 6 },
          issues: [{ code: "INSUFFICIENT_STOCK", available: 6 }],
        }),
        line({
          variantId: "b",
          quantity: 60,
          rule: { min: 50, step: 10, max: null, available: 30 },
          issues: [{ code: "INSUFFICIENT_STOCK", available: 30 }],
        }),
        line({ variantId: "c", issues: [{ code: "UNAVAILABLE" }] }),
        line({ variantId: "d" }),
      ]),
    );
    expect(fixes.map(({ variantId, from, to }) => ({ variantId, from, to }))).toEqual([
      { variantId: "a", from: 10, to: 6 },
      { variantId: "b", from: 60, to: null }, // below the 50-chick minimum
      { variantId: "c", from: 4, to: null },
    ]);
  });

  it("snaps a quantity that breaks the step rule down to a valid one (BR-06)", () => {
    const [fix] = stockFixes(
      quote([
        line({
          quantity: 65,
          rule: { min: 50, step: 10, max: null, available: null },
          issues: [{ code: "QUANTITY_RULE", min: 50, step: 10, max: null }],
        }),
      ]),
    );
    expect(fix?.to).toBe(60);
  });
});

describe("priceChanges", () => {
  it("lists only lines whose unit price moved", () => {
    const before = quote([
      line({ variantId: "a" }),
      line({ variantId: "b", unitPriceMinor: 40_000 }),
    ]);
    const after = quote([
      line({ variantId: "a", unitPriceMinor: 57_000 }),
      line({ variantId: "b", unitPriceMinor: 40_000 }),
    ]);
    expect(priceChanges(before, after)).toEqual([
      {
        variantId: "a",
        name: "Farm fresh eggs (Tray of 30)",
        unit: "tray",
        fromMinor: 55_000,
        toMinor: 57_000,
      },
    ]);
    expect(priceChanges(undefined, after)).toEqual([]);
  });
});
