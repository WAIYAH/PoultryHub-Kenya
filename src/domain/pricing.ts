import type { DeliveryZone, MinorUnits } from "@/types/domain";

// Price arithmetic shared by the mock data source and its tests. The authoritative versions run in
// Postgres from Phase 4 (`quote_cart`, `place_order`); these mirror them rule for rule.

/**
 * BR-02 + BR-30: percentage discounts are rounded to the nearest whole shilling (half up), capped
 * by `maxMinor` when set, and never exceed the subtotal.
 */
export function percentageDiscountMinor(
  subtotalMinor: MinorUnits,
  percent: number,
  maxMinor: MinorUnits | null = null,
): MinorUnits {
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) {
    throw new RangeError(`Percentage discounts are whole percents from 1 to 100, got ${percent}`);
  }
  // subtotal × percent / 100 is the discount in minor units; ÷ 100 again gives shillings.
  const shillings = Math.floor((subtotalMinor * percent + 5_000) / 10_000);
  const discount = shillings * 100;
  return Math.min(discount, maxMinor ?? discount, subtotalMinor);
}

/** BR-30: a fixed discount never exceeds the subtotal. */
export function fixedDiscountMinor(subtotalMinor: MinorUnits, amountMinor: MinorUnits): MinorUnits {
  return Math.min(amountMinor, subtotalMinor);
}

/** BR-13: the zone fee, or free when the subtotal reaches the zone's free-delivery threshold. */
export function deliveryFeeMinor(
  zone: Pick<DeliveryZone, "feeMinor" | "freeOverMinor">,
  subtotalMinor: MinorUnits,
): MinorUnits {
  return zone.freeOverMinor !== null && subtotalMinor >= zone.freeOverMinor ? 0 : zone.feeMinor;
}

/** How much more the customer must add to qualify for free delivery, or null. */
export function amountToFreeDeliveryMinor(
  zone: Pick<DeliveryZone, "freeOverMinor">,
  subtotalMinor: MinorUnits,
): MinorUnits | null {
  if (zone.freeOverMinor === null || subtotalMinor >= zone.freeOverMinor) return null;
  return zone.freeOverMinor - subtotalMinor;
}
