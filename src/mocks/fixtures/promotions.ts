// SAMPLE DATA: promo codes for exercising BR-30 in the demo. Not real offers.
import type { MinorUnits } from "@/types/domain";

export interface FixturePromotion {
  code: string;
  description: string;
  discountType: "percentage" | "fixed_amount";
  /** Whole percent for "percentage"; minor units for "fixed_amount". */
  discountValue: number;
  maxDiscountMinor: MinorUnits | null;
  minSubtotalMinor: MinorUnits | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
}

export const promotions: FixturePromotion[] = [
  {
    code: "KARIBU10",
    description: "10% off (up to KSh 500) on orders of KSh 1,000 or more",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountMinor: 50_000,
    minSubtotalMinor: 100_000,
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: null,
    isActive: true,
  },
  {
    code: "BULK500",
    description: "KSh 500 off orders of KSh 10,000 or more",
    discountType: "fixed_amount",
    discountValue: 50_000,
    maxDiscountMinor: null,
    minSubtotalMinor: 1_000_000,
    startsAt: "2026-01-01T00:00:00Z",
    endsAt: null,
    isActive: true,
  },
  {
    code: "EASTER25",
    description: "25% off over Easter",
    discountType: "percentage",
    discountValue: 25,
    maxDiscountMinor: null,
    minSubtotalMinor: null,
    startsAt: "2026-04-01T00:00:00Z",
    endsAt: "2026-04-07T21:00:00Z",
    isActive: true,
  },
];
