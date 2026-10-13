import type { Availability, ProductVariant, PurchaseMode } from "@/types/domain";

// Storefront availability label for a product (CAT-11). Mirrors the `storefront_products` view
// planned in DATABASE.md §4.2 so the mock and Supabase data sources agree.

type VariantStock = Pick<
  ProductVariant,
  "trackInventory" | "stockQuantity" | "lowStockThreshold" | "availableFrom"
>;

export function deriveAvailability(
  product: { purchaseMode: PurchaseMode; variants: readonly VariantStock[] },
  today: string = new Date().toISOString().slice(0, 10),
): Availability {
  if (product.purchaseMode === "enquiry") return "enquiry";
  const variants = product.variants;
  if (variants.length === 0) return "out_of_stock";

  const sellable = variants.filter((v) => !v.trackInventory || v.stockQuantity > 0);
  if (sellable.length === 0) {
    const upcoming = variants.some((v) => v.availableFrom !== null && v.availableFrom > today);
    return upcoming ? "pre_order" : "out_of_stock";
  }
  const comfortable = sellable.some(
    (v) => !v.trackInventory || v.stockQuantity > v.lowStockThreshold,
  );
  return comfortable ? "in_stock" : "low_stock";
}
