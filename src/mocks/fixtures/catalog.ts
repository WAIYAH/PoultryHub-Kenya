// SAMPLE DATA: development fixtures only. Names, prices and stock are illustrative and are NOT
// the business's real catalogue (REQUIREMENTS.md A-15/BR-31). Phase 2 expands this set; Phase 3
// moves it into supabase/seed.sql. Every SKU starts with "SAMPLE-" so leaks are easy to detect.
import type { Category, ProductDetail } from "@/types/domain";

export type FixtureProduct = Omit<
  ProductDetail,
  "availability" | "fromPriceMinor" | "defaultUnit" | "category"
> & {
  categorySlug: string;
  fixture?: {
    /** Simulates a product published after the last build: reachable, but not pre-rendered (spike S1). */
    publishedAfterBuild?: boolean;
  };
};

export const categories: Category[] = [
  {
    id: "cat-eggs",
    slug: "eggs",
    name: "Eggs",
    description: "Fresh table eggs, sold by the tray.",
  },
  {
    id: "cat-chicks",
    slug: "day-old-chicks",
    name: "Day-old chicks",
    description: "Vaccinated day-old chicks from scheduled batches.",
  },
  {
    id: "cat-live-birds",
    slug: "live-birds",
    name: "Live birds",
    description: "Broilers and kienyeji birds.",
  },
  {
    id: "cat-feeds",
    slug: "feeds-and-supplies",
    name: "Feeds & supplies",
    description: "Feeds, feeders and drinkers.",
  },
];

export const products: FixtureProduct[] = [
  {
    id: "prd-eggs-large",
    slug: "farm-fresh-eggs",
    name: "Farm fresh eggs",
    categorySlug: "eggs",
    shortDescription: "Brown table eggs, collected daily and packed in trays of 30.",
    description:
      "SAMPLE PRODUCT. Brown table eggs collected daily, graded by size and packed in clean trays of 30.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    image: null,
    images: [],
    specifications: [
      { label: "Pack", value: "Tray of 30 eggs" },
      { label: "Shell colour", value: "Brown" },
    ],
    variants: [
      {
        id: "var-eggs-tray-large",
        name: "Tray of 30 (large)",
        sku: "SAMPLE-EGG-L-30",
        priceMinor: 55_000,
        compareAtPriceMinor: null,
        unit: "tray",
        unitDescription: "30 large eggs",
        minOrderQty: 1,
        orderStep: 1,
        maxOrderQty: 50,
        trackInventory: true,
        stockQuantity: 120,
        lowStockThreshold: 10,
        availableFrom: null,
        isDefault: true,
      },
      {
        id: "var-eggs-tray-medium",
        name: "Tray of 30 (medium)",
        sku: "SAMPLE-EGG-M-30",
        priceMinor: 50_000,
        compareAtPriceMinor: null,
        unit: "tray",
        unitDescription: "30 medium eggs",
        minOrderQty: 1,
        orderStep: 1,
        maxOrderQty: 50,
        trackInventory: true,
        stockQuantity: 8,
        lowStockThreshold: 10,
        availableFrom: null,
        isDefault: false,
      },
    ],
  },
  {
    id: "prd-chicks-kienyeji",
    slug: "improved-kienyeji-chicks",
    name: "Improved kienyeji day-old chicks",
    categorySlug: "day-old-chicks",
    shortDescription: "Day-old chicks from scheduled batches. Minimum order 50.",
    description:
      "SAMPLE PRODUCT. Day-old improved kienyeji chicks, sold in multiples of 10 with a minimum of 50.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: true,
    image: null,
    images: [],
    specifications: [
      { label: "Age", value: "Day-old" },
      { label: "Minimum order", value: "50 chicks" },
    ],
    variants: [
      {
        id: "var-chicks-kienyeji",
        name: "Per chick",
        sku: "SAMPLE-CHK-KNY",
        priceMinor: 12_000,
        compareAtPriceMinor: null,
        unit: "chick",
        unitDescription: null,
        minOrderQty: 50,
        orderStep: 10,
        maxOrderQty: 1_000,
        trackInventory: true,
        stockQuantity: 600,
        lowStockThreshold: 100,
        availableFrom: null,
        isDefault: true,
      },
    ],
  },
  {
    id: "prd-broilers",
    slug: "live-broilers",
    name: "Live broilers",
    categorySlug: "live-birds",
    shortDescription: "Market-ready broilers, priced per bird by weight band.",
    description:
      "SAMPLE PRODUCT. Live broilers sold per bird in weight bands; no re-weighing at delivery.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    image: null,
    images: [],
    specifications: [{ label: "Sold as", value: "Per bird, by weight band" }],
    variants: [
      {
        id: "var-broiler-2kg",
        name: "2.0–2.5 kg",
        sku: "SAMPLE-BRL-2025",
        priceMinor: 75_000,
        compareAtPriceMinor: null,
        unit: "bird",
        unitDescription: "Live weight 2.0–2.5 kg",
        minOrderQty: 1,
        orderStep: 1,
        maxOrderQty: null,
        trackInventory: true,
        stockQuantity: 40,
        lowStockThreshold: 5,
        availableFrom: null,
        isDefault: true,
      },
    ],
  },
  {
    id: "prd-layers-mash",
    slug: "layers-mash",
    name: "Layers mash",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Complete feed for laying hens.",
    description: "SAMPLE PRODUCT. Complete layers mash for hens in lay.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    image: null,
    images: [],
    specifications: [{ label: "Form", value: "Mash" }],
    fixture: { publishedAfterBuild: true },
    variants: [
      {
        id: "var-layers-70",
        name: "70 kg bag",
        sku: "SAMPLE-FD-LAY-70",
        priceMinor: 420_000,
        compareAtPriceMinor: null,
        unit: "bag",
        unitDescription: "70 kg",
        minOrderQty: 1,
        orderStep: 1,
        maxOrderQty: 20,
        trackInventory: true,
        stockQuantity: 25,
        lowStockThreshold: 5,
        availableFrom: null,
        isDefault: true,
      },
    ],
  },
];
