import type { Availability, ProductVariant, PurchaseMode } from "@/types/domain";

// Storefront availability label for a product (CAT-11). Mirrors the `storefront_products` view
// planned in DATABASE.md §4.2 so the mock and Supabase data sources agree.

type VariantStock = Pick<
  ProductVariant,
  "trackInventory" | "stockQuantity" | "lowStockThreshold" | "availableFrom"
>;

export function deriveAvailability(
  product: { purchaseMode: PurchaseMode; variants: readonly VariantStock[] },
  today: string = todayInEat(),
): Availability {
  if (product.purchaseMode === "enquiry") return "enquiry";
  const variants = product.variants;
  if (variants.length === 0) return "out_of_stock";

  const sellable = variants.filter((v) => !v.trackInventory || v.stockQuantity > 0);
  if (sellable.length === 0) {
    const upcoming = variants.some((v) => isUpcoming(v, today));
    return upcoming ? "pre_order" : "out_of_stock";
  }
  // D3: a future batch's capacity is its stock, so it can be booked now ("Ready from …").
  const readyNow = sellable.filter((v) => !isUpcoming(v, today));
  if (readyNow.length === 0) return "pre_order";
  const comfortable = readyNow.some(
    (v) => !v.trackInventory || v.stockQuantity > v.lowStockThreshold,
  );
  return comfortable ? "in_stock" : "low_stock";
}

function isUpcoming(variant: VariantStock, today: string): boolean {
  return variant.availableFrom !== null && variant.availableFrom > today;
}

/** Today's date in East Africa Time (YYYY-MM-DD), the calendar used for batch dates. */
export function todayInEat(now: number = Date.now()): string {
  return new Date(now + 3 * 3_600_000).toISOString().slice(0, 10);
}
