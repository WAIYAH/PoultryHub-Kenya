// Domain types used by the UI. Database rows (snake_case) are mapped into these in
// src/services/supabase (Phase 3); fixtures use them directly.

/** Money in minor units (1 KES = 100). Always an integer. */
export type MinorUnits = number;

export type SaleUnit =
  "tray" | "crate" | "dozen" | "piece" | "chick" | "bird" | "bag" | "kg" | "litre" | "pack";

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "pre_order" | "enquiry";

export type PurchaseMode = "cart" | "enquiry";

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
}

export interface ProductImage {
  /** Path or URL of the largest rendition. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  priceMinor: MinorUnits;
  compareAtPriceMinor: MinorUnits | null;
  unit: SaleUnit;
  unitDescription: string | null;
  minOrderQty: number;
  orderStep: number;
  maxOrderQty: number | null;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  /** ISO date (YYYY-MM-DD) for batch or pre-order availability. */
  availableFrom: string | null;
  isDefault: boolean;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  category: Pick<Category, "slug" | "name">;
  fromPriceMinor: MinorUnits;
  defaultUnit: SaleUnit;
  availability: Availability;
  image: ProductImage | null;
  isFeatured: boolean;
  purchaseMode: PurchaseMode;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  variants: ProductVariant[];
  images: ProductImage[];
  specifications: ProductSpecification[];
  collectionOnly: boolean;
}

export interface PageRequest {
  page?: number;
  pageSize?: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "name";

export interface ProductQuery extends PageRequest {
  q?: string;
  category?: string;
  availability?: Availability[];
  minPriceMinor?: MinorUnits;
  maxPriceMinor?: MinorUnits;
  sort?: ProductSort;
}
