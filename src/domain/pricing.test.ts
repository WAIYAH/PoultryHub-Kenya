import { describe, expect, it } from "vitest";

import {
  amountToFreeDeliveryMinor,
  deliveryFeeMinor,
  fixedDiscountMinor,
  percentageDiscountMinor,
} from "./pricing";

describe("percentageDiscountMinor (BR-02, BR-30)", () => {
  it("returns whole shillings", () => {
    expect(percentageDiscountMinor(123_400, 10)).toBe(12_300); // KSh 123.40 → KSh 123
  });

  it("rounds half a shilling up", () => {
    expect(percentageDiscountMinor(105_000, 10)).toBe(10_500); // exactly KSh 105
    expect(percentageDiscountMinor(1_500, 10)).toBe(200); // KSh 1.50 → KSh 2
    expect(percentageDiscountMinor(1_400, 10)).toBe(100); // KSh 1.40 → KSh 1
  });

  it("applies the cap", () => {
    expect(percentageDiscountMinor(1_000_000, 10, 50_000)).toBe(50_000);
  });

  it("never exceeds the subtotal", () => {
    expect(percentageDiscountMinor(30_000, 100)).toBe(30_000);
  });

  it("rejects fractional or out-of-range percentages", () => {
    expect(() => percentageDiscountMinor(10_000, 0)).toThrow(RangeError);
    expect(() => percentageDiscountMinor(10_000, 12.5)).toThrow(RangeError);
    expect(() => percentageDiscountMinor(10_000, 101)).toThrow(RangeError);
  });
});

describe("fixedDiscountMinor (BR-30)", () => {
  it("never exceeds the subtotal", () => {
    expect(fixedDiscountMinor(30_000, 50_000)).toBe(30_000);
    expect(fixedDiscountMinor(80_000, 50_000)).toBe(50_000);
  });
});

describe("deliveryFeeMinor (BR-13)", () => {
  const zone = { feeMinor: 20_000, freeOverMinor: 300_000 };

  it("charges the zone fee below the threshold", () => {
    expect(deliveryFeeMinor(zone, 299_900)).toBe(20_000);
  });

  it("is free at or above the threshold", () => {
    expect(deliveryFeeMinor(zone, 300_000)).toBe(0);
  });

  it("always charges when the zone has no threshold", () => {
    expect(deliveryFeeMinor({ feeMinor: 50_000, freeOverMinor: null }, 10_000_000)).toBe(50_000);
  });

  it("says how much is left to free delivery", () => {
    expect(amountToFreeDeliveryMinor(zone, 250_000)).toBe(50_000);
    expect(amountToFreeDeliveryMinor(zone, 300_000)).toBeNull();
    expect(amountToFreeDeliveryMinor({ freeOverMinor: null }, 0)).toBeNull();
  });
});
