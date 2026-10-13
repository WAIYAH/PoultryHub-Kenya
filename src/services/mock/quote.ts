import { formatKES } from "@/domain/money";
import { deliveryFeeMinor, fixedDiscountMinor, percentageDiscountMinor } from "@/domain/pricing";
import { isValidQuantity } from "@/domain/units";
import { deliveryAreas, deliveryZones, pickupLocations } from "@/mocks/fixtures/delivery";
import { promotions } from "@/mocks/fixtures/promotions";
import type {
  CartQuote,
  CartQuoteInput,
  ProductDetail,
  QuoteIssue,
  QuoteLine,
  QuoteLineIssue,
} from "@/types/domain";

import type { MockScenario } from "./scenario";

// The mock `quote_cart` (API_AND_INTEGRATIONS.md §4). Prices, stock, discount and delivery come
// from the "server" side only; nothing the client sends is trusted except ids and quantities (BR-03).

function unavailableLine(variantId: string, quantity: number): QuoteLine {
  return {
    variantId,
    productSlug: "",
    productName: "Item no longer available",
    variantName: "",
    unit: "piece",
    unitPriceMinor: 0,
    quantity,
    lineTotalMinor: 0,
    image: null,
    rule: { min: 1, step: 1, max: null, available: 0 },
    collectionOnly: false,
    issues: [{ code: "UNAVAILABLE" }],
  };
}

function buildLine(
  products: ProductDetail[],
  variantId: string,
  quantity: number,
  fulfilment: CartQuoteInput["fulfilment"],
): QuoteLine {
  const product = products.find((p) => p.variants.some((v) => v.id === variantId));
  const variant = product?.variants.find((v) => v.id === variantId);
  if (!product || !variant) return unavailableLine(variantId, quantity);

  const available = variant.trackInventory ? variant.stockQuantity : null;
  const rule = {
    min: variant.minOrderQty,
    step: variant.orderStep,
    max: variant.maxOrderQty,
    available,
  };
  const issues: QuoteLineIssue[] = [];
  if (product.purchaseMode === "enquiry") {
    issues.push({ code: "UNAVAILABLE" });
  } else {
    if (available !== null && quantity > available) {
      issues.push({ code: "INSUFFICIENT_STOCK", available });
    }
    // BR-06, checked without the stock cap (reported separately above).
    if (!isValidQuantity(quantity, { min: rule.min, step: rule.step, max: rule.max })) {
      issues.push({ code: "QUANTITY_RULE", min: rule.min, step: rule.step, max: rule.max });
    }
  }
  if (fulfilment === "delivery" && product.collectionOnly) {
    issues.push({ code: "COLLECTION_ONLY" }); // BR-14
  }

  return {
    variantId,
    productSlug: product.slug,
    productName: product.name,
    variantName: variant.name,
    unit: variant.unit,
    unitPriceMinor: variant.priceMinor,
    quantity,
    lineTotalMinor: variant.priceMinor * quantity,
    image: product.image,
    rule,
    collectionOnly: product.collectionOnly,
    issues,
  };
}

export function computeQuote(
  input: CartQuoteInput,
  products: ProductDetail[],
  scenarios: ReadonlySet<MockScenario>,
  now: number = Date.now(),
): CartQuote {
  const lines = input.items.map((item) =>
    buildLine(products, item.variantId, item.quantity, input.fulfilment),
  );
  const subtotalMinor = lines
    .filter((line) => !line.issues.some((issue) => issue.code === "UNAVAILABLE"))
    .reduce((sum, line) => sum + line.lineTotalMinor, 0);
  const issues: QuoteIssue[] = [];

  // Promotions (BR-30): one code per order, never more than the subtotal, never on delivery.
  let discountMinor = 0;
  let promo: CartQuote["promo"] = null;
  const code = input.promoCode?.trim().toUpperCase();
  if (code) {
    const found = promotions.find((p) => p.code === code && p.isActive);
    let reason: string | null = null;
    if (!found) reason = "This code isn't valid.";
    else if (now < Date.parse(found.startsAt)) reason = "This code isn't active yet.";
    else if (found.endsAt && now > Date.parse(found.endsAt)) reason = "This code has expired.";
    else if (found.minSubtotalMinor !== null && subtotalMinor < found.minSubtotalMinor) {
      reason = `This code needs an order of ${formatKES(found.minSubtotalMinor)} or more.`;
    }
    if (found && reason === null) {
      discountMinor =
        found.discountType === "percentage"
          ? percentageDiscountMinor(subtotalMinor, found.discountValue, found.maxDiscountMinor)
          : fixedDiscountMinor(subtotalMinor, found.discountValue);
      promo = { code: found.code, description: found.description };
    } else {
      issues.push({ code: "PROMO_INVALID", reason: reason ?? "This code isn't valid." });
    }
  }

  // Delivery (BR-13, BR-15, BR-16) or pick-up.
  let feeMinor: number | null = null;
  let delivery: CartQuote["delivery"] = null;
  if (input.fulfilment === "collection") {
    feeMinor = 0;
  } else if (input.fulfilment === "delivery" && input.deliveryAreaId) {
    const area = deliveryAreas.find((a) => a.id === input.deliveryAreaId);
    const zone = area && deliveryZones.find((z) => z.id === area.zoneId);
    if (!zone || scenarios.has("area-closed")) {
      issues.push({ code: "AREA_NOT_SERVED" });
    } else {
      feeMinor = deliveryFeeMinor(zone, subtotalMinor);
      delivery = {
        zoneName: zone.name,
        etaMinDays: zone.etaMinDays,
        etaMaxDays: zone.etaMaxDays,
        freeOverMinor: zone.freeOverMinor,
        schedule: zone.schedule,
      };
      if (zone.minOrderMinor !== null && subtotalMinor < zone.minOrderMinor) {
        issues.push({ code: "BELOW_MINIMUM_ORDER", minimumMinor: zone.minOrderMinor });
      }
    }
  }

  return {
    lines,
    subtotalMinor,
    discountMinor,
    deliveryFeeMinor: feeMinor,
    totalMinor: subtotalMinor - discountMinor + (feeMinor ?? 0),
    delivery,
    promo,
    issues,
  };
}

export function findPickupLocation(id: string) {
  return pickupLocations.find((location) => location.id === id) ?? null;
}

export function findDeliveryArea(id: string) {
  const area = deliveryAreas.find((a) => a.id === id);
  const zone = area && deliveryZones.find((z) => z.id === area.zoneId);
  return area && zone ? { area, zone } : null;
}
