// SAMPLE DATA: development fixtures only. Names, prices and stock are illustrative and are NOT
// the business's real catalogue (REQUIREMENTS.md A-15/BR-31). Phase 3 moves this set into
// supabase/seed.sql. Every SKU starts with "SAMPLE-" so leaks are easy to detect.
import type { Category, ProductDetail, ProductImage, ProductVariant } from "@/types/domain";

import { daysFromNow } from "./dates";
import { photo } from "./images";

export type FixtureCategory = Omit<Category, "productCount" | "fromPriceMinor">;

/** What an admin enters. Derived fields (availability, prices, default variant) are computed. */
export type FixtureProduct = Omit<
  ProductDetail,
  | "availability"
  | "fromPriceMinor"
  | "defaultUnit"
  | "category"
  | "hasPriceRange"
  | "defaultVariant"
  | "image"
> & {
  categorySlug: string;
  /** Extra search terms, including Swahili synonyms (CAT-12). */
  searchKeywords: string[];
  fixture?: {
    /** Simulates a product published after the last build: reachable, but not pre-rendered (spike S1). */
    publishedAfterBuild?: boolean;
  };
};

type VariantInput = Pick<ProductVariant, "id" | "name" | "sku" | "priceMinor" | "unit"> &
  Partial<ProductVariant>;

function variant(input: VariantInput): ProductVariant {
  return {
    compareAtPriceMinor: null,
    unitDescription: null,
    minOrderQty: 1,
    orderStep: 1,
    maxOrderQty: null,
    trackInventory: true,
    stockQuantity: 0,
    lowStockThreshold: 5,
    availableFrom: null,
    isDefault: false,
    ...input,
  };
}

const noImages: ProductImage[] = [];

export const categories: FixtureCategory[] = [
  {
    id: "cat-eggs",
    slug: "eggs",
    name: "Eggs",
    description:
      "Table eggs and kienyeji eggs, sold by the tray of 30. Businesses can order in bulk or set up a regular supply.",
    image: photo("kenya-eggs-tray", "landscape", "Brown eggs in trays of 30"),
  },
  {
    id: "cat-chicks",
    slug: "day-old-chicks",
    name: "Day-old chicks",
    description:
      "Layer, broiler and improved kienyeji chicks from scheduled batches, with minimum orders. Collect them at the farm on the batch date.",
    image: photo("baby-chicks", "landscape", "Day-old chicks huddled together on wood shavings"),
  },
  {
    id: "cat-live-birds",
    slug: "live-birds",
    name: "Live birds",
    description:
      "Broilers priced per bird by weight band, kienyeji cockerels, point-of-lay pullets and spent hens.",
    image: photo("flock", "landscape", "A flock of brown and white chickens on a small farm"),
  },
  {
    id: "cat-feeds",
    slug: "feeds-and-supplies",
    name: "Feeds & supplies",
    description:
      "Feeds for every stage, feeders, drinkers, egg trays and dried manure for your garden.",
    image: photo("hens-feeder", "landscape", "Hens feeding from a galvanised hanging feeder"),
  },
];

export const products: FixtureProduct[] = [
  // ---- Eggs -------------------------------------------------------------------------------
  {
    id: "prd-eggs-large",
    slug: "farm-fresh-eggs",
    name: "Farm fresh eggs",
    categorySlug: "eggs",
    shortDescription: "Brown table eggs, collected daily and packed in trays of 30.",
    description:
      "SAMPLE PRODUCT. Brown table eggs collected daily, graded by size and packed in clean trays of 30.\n\nStore them in a cool place or the fridge, pointed end down, and wash them just before use.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-07-01T06:00:00Z",
    images: [photo("kenya-eggs-tray", "square", "Brown eggs packed in a tray of 30")],
    searchKeywords: ["mayai", "egg", "tray", "trei", "brown eggs"],
    specifications: [
      { label: "Pack", value: "Tray of 30 eggs" },
      { label: "Shell colour", value: "Brown" },
      { label: "Grades", value: "Large and medium" },
    ],
    variants: [
      variant({
        id: "var-eggs-tray-large",
        name: "Tray of 30 (large)",
        sku: "SAMPLE-EGG-L-30",
        priceMinor: 55_000,
        unit: "tray",
        unitDescription: "30 large eggs",
        maxOrderQty: 50,
        stockQuantity: 120,
        lowStockThreshold: 10,
        isDefault: true,
      }),
      variant({
        id: "var-eggs-tray-medium",
        name: "Tray of 30 (medium)",
        sku: "SAMPLE-EGG-M-30",
        priceMinor: 50_000,
        unit: "tray",
        unitDescription: "30 medium eggs",
        maxOrderQty: 50,
        stockQuantity: 8,
        lowStockThreshold: 10,
      }),
    ],
  },
  {
    id: "prd-eggs-kienyeji",
    slug: "kienyeji-eggs",
    name: "Kienyeji eggs",
    categorySlug: "eggs",
    shortDescription: "Eggs from improved kienyeji hens, by the tray or half tray.",
    description:
      "SAMPLE PRODUCT. Smaller eggs from improved kienyeji hens. Sold by the tray of 30 or the half tray of 15.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-07-04T06:00:00Z",
    images: [photo("kenya-eggs-hand", "square", "Three pale kienyeji eggs held in a hand")],
    searchKeywords: ["mayai ya kienyeji", "kienyeji", "indigenous", "mayai"],
    specifications: [
      { label: "Pack", value: "Tray of 30 or half tray of 15" },
      { label: "Shell colour", value: "Light brown to cream" },
    ],
    variants: [
      variant({
        id: "var-kienyeji-eggs-30",
        name: "Tray of 30",
        sku: "SAMPLE-EGG-K-30",
        priceMinor: 78_000,
        unit: "tray",
        unitDescription: "30 kienyeji eggs",
        maxOrderQty: 20,
        stockQuantity: 30,
        lowStockThreshold: 6,
        isDefault: true,
      }),
      variant({
        id: "var-kienyeji-eggs-15",
        name: "Half tray (15)",
        sku: "SAMPLE-EGG-K-15",
        priceMinor: 40_000,
        unit: "tray",
        unitDescription: "15 kienyeji eggs",
        maxOrderQty: 20,
        stockQuantity: 20,
        lowStockThreshold: 6,
      }),
    ],
  },
  {
    id: "prd-eggs-bulk",
    slug: "eggs-for-business",
    name: "Eggs for business (10 trays or more)",
    categorySlug: "eggs",
    shortDescription: "Large table eggs for hotels, shops and schools. Minimum 10 trays.",
    description:
      "SAMPLE PRODUCT. Large brown eggs at a bulk price for hotels, restaurants, shops and schools. Order from 10 trays, in steps of 5.\n\nFor a regular weekly supply, request a quote instead.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-08-02T06:00:00Z",
    images: [photo("kenya-eggs-tray", "square", "Brown eggs packed in a tray of 30")],
    searchKeywords: ["wholesale", "bulk", "jumla", "hotel", "mayai", "restaurant"],
    specifications: [
      { label: "Pack", value: "Trays of 30 large eggs" },
      { label: "Minimum order", value: "10 trays" },
    ],
    variants: [
      variant({
        id: "var-eggs-bulk-tray",
        name: "Per tray (large)",
        sku: "SAMPLE-EGG-BULK",
        priceMinor: 52_000,
        unit: "tray",
        unitDescription: "30 large eggs",
        minOrderQty: 10,
        orderStep: 5,
        maxOrderQty: 200,
        stockQuantity: 400,
        lowStockThreshold: 50,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-egg-supply",
    slug: "regular-egg-supply",
    name: "Regular egg supply for businesses",
    categorySlug: "eggs",
    shortDescription: "Weekly or twice-weekly deliveries at an agreed price. Request a quote.",
    description:
      "SAMPLE PRODUCT. A standing order of eggs delivered on a schedule that suits your business. Tell us your weekly volume and delivery days, and we'll send a quote.",
    purchaseMode: "enquiry",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-08-02T06:00:00Z",
    images: noImages,
    searchKeywords: ["supply", "contract", "weekly", "wholesale", "jumla", "mayai"],
    specifications: [{ label: "Pricing", value: "Quoted per tray, by volume" }],
    variants: [
      variant({
        id: "var-egg-supply",
        name: "Weekly supply",
        sku: "SAMPLE-EGG-SUPPLY",
        priceMinor: 50_000,
        unit: "tray",
        unitDescription: "Indicative price per tray",
        trackInventory: false,
        isDefault: true,
      }),
    ],
  },

  // ---- Day-old chicks ---------------------------------------------------------------------
  {
    id: "prd-chicks-kienyeji",
    slug: "improved-kienyeji-chicks",
    name: "Improved kienyeji day-old chicks",
    categorySlug: "day-old-chicks",
    shortDescription: "Day-old chicks from scheduled batches. Minimum order 50.",
    description:
      "SAMPLE PRODUCT. Day-old improved kienyeji chicks, sold in multiples of 10 with a minimum of 50.\n\nChicks are collected at the farm so they travel the shortest time. Bring a ventilated box, and have your brooder warm before you arrive.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: true,
    publishedAt: "2026-07-10T06:00:00Z",
    images: [
      photo("kenya-hen-chicks", "square", "A kienyeji hen with her young chicks in a grassy yard"),
      photo("baby-chicks", "square", "Day-old chicks huddled together on wood shavings"),
    ],
    searchKeywords: ["vifaranga", "kienyeji", "chicks", "day old", "kifaranga"],
    specifications: [
      { label: "Age", value: "Day-old" },
      { label: "Minimum order", value: "50 chicks, then multiples of 10" },
      { label: "Collection", value: "At the farm on the batch date" },
    ],
    variants: [
      variant({
        id: "var-chicks-kienyeji",
        name: "Per chick",
        sku: "SAMPLE-CHK-KNY",
        priceMinor: 12_000,
        unit: "chick",
        minOrderQty: 50,
        orderStep: 10,
        maxOrderQty: 1_000,
        stockQuantity: 600,
        lowStockThreshold: 100,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-chicks-broiler",
    slug: "broiler-chicks",
    name: "Broiler day-old chicks",
    categorySlug: "day-old-chicks",
    shortDescription: "Next batch ready soon. Book from 50 chicks, in multiples of 50.",
    description:
      "SAMPLE PRODUCT. Broiler chicks from our next scheduled batch. Book now and collect on the batch date shown.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: true,
    publishedAt: "2026-09-15T06:00:00Z",
    images: [photo("baby-chicks", "square", "Day-old chicks huddled together on wood shavings")],
    searchKeywords: ["vifaranga vya nyama", "broiler", "chicks", "kuku wa nyama"],
    specifications: [
      { label: "Age", value: "Day-old" },
      { label: "Minimum order", value: "50 chicks, in multiples of 50" },
    ],
    variants: [
      variant({
        id: "var-chicks-broiler",
        name: "Per chick",
        sku: "SAMPLE-CHK-BRL",
        priceMinor: 11_000,
        unit: "chick",
        minOrderQty: 50,
        orderStep: 50,
        maxOrderQty: 2_000,
        stockQuantity: 500,
        lowStockThreshold: 100,
        availableFrom: daysFromNow(9),
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-chicks-layer",
    slug: "layer-chicks",
    name: "Layer day-old chicks",
    categorySlug: "day-old-chicks",
    shortDescription: "Chicks for egg production. Minimum 100, in multiples of 50.",
    description:
      "SAMPLE PRODUCT. Layer chicks for egg production. They usually start laying at about 18 to 20 weeks with good feeding and care.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: true,
    publishedAt: "2026-08-20T06:00:00Z",
    images: [photo("chicks-crate", "square", "Young brown chicks in a red plastic crate")],
    searchKeywords: ["vifaranga", "layers", "kuku wa mayai", "chicks"],
    specifications: [
      { label: "Age", value: "Day-old" },
      { label: "Minimum order", value: "100 chicks, in multiples of 50" },
    ],
    variants: [
      variant({
        id: "var-chicks-layer",
        name: "Per chick",
        sku: "SAMPLE-CHK-LAY",
        priceMinor: 15_000,
        unit: "chick",
        minOrderQty: 100,
        orderStep: 50,
        maxOrderQty: 2_000,
        stockQuantity: 300,
        lowStockThreshold: 100,
        isDefault: true,
      }),
    ],
  },

  // ---- Live birds -------------------------------------------------------------------------
  {
    id: "prd-broilers",
    slug: "live-broilers",
    name: "Live broilers",
    categorySlug: "live-birds",
    shortDescription: "Market-ready broilers, priced per bird by weight band.",
    description:
      "SAMPLE PRODUCT. Live broilers sold per bird in weight bands. The price is fixed by the band you choose; there is no re-weighing at delivery.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-07-15T06:00:00Z",
    images: [
      photo("broilers-feeder", "square", "White broilers in a house with a feeder and a drinker"),
    ],
    searchKeywords: ["kuku wa nyama", "broiler", "kuku", "chicken", "meat"],
    specifications: [
      { label: "Sold as", value: "Per bird, by live-weight band" },
      { label: "Age", value: "About 6 weeks" },
    ],
    variants: [
      variant({
        id: "var-broiler-1520",
        name: "1.5–2.0 kg",
        sku: "SAMPLE-BRL-1520",
        priceMinor: 60_000,
        unit: "bird",
        unitDescription: "Live weight 1.5–2.0 kg",
        stockQuantity: 25,
      }),
      variant({
        id: "var-broiler-2kg",
        name: "2.0–2.5 kg",
        sku: "SAMPLE-BRL-2025",
        priceMinor: 75_000,
        unit: "bird",
        unitDescription: "Live weight 2.0–2.5 kg",
        stockQuantity: 40,
        isDefault: true,
      }),
      variant({
        id: "var-broiler-2530",
        name: "2.5–3.0 kg",
        sku: "SAMPLE-BRL-2530",
        priceMinor: 85_000,
        unit: "bird",
        unitDescription: "Live weight 2.5–3.0 kg",
        stockQuantity: 4,
      }),
    ],
  },
  {
    id: "prd-kienyeji-cockerel",
    slug: "kienyeji-cockerels",
    name: "Kienyeji cockerels",
    categorySlug: "live-birds",
    shortDescription: "Mature improved kienyeji cockerels, about 2.5–3 kg each.",
    description:
      "SAMPLE PRODUCT. Mature improved kienyeji cockerels, popular for family occasions. Sold per bird.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-08-10T06:00:00Z",
    images: [photo("rooster", "square", "A red and black cockerel standing on a path")],
    searchKeywords: ["jogoo", "kienyeji", "kuku wa kienyeji", "cockerel", "rooster"],
    specifications: [{ label: "Live weight", value: "About 2.5–3 kg" }],
    variants: [
      variant({
        id: "var-kienyeji-cockerel",
        name: "Per bird",
        sku: "SAMPLE-KNY-COCK",
        priceMinor: 150_000,
        unit: "bird",
        stockQuantity: 12,
        lowStockThreshold: 4,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-pullets",
    slug: "point-of-lay-pullets",
    name: "Point-of-lay pullets",
    categorySlug: "live-birds",
    shortDescription: "Young hens about to start laying. Minimum 10, in multiples of 5.",
    description:
      "SAMPLE PRODUCT. Point-of-lay pullets at about 18 weeks, ready to move into your layer house. Sold from 10 birds, in multiples of 5.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-09-01T06:00:00Z",
    images: [
      photo("hens-farm", "square", "Brown hens standing close together"),
      photo("hens-pasture", "square", "A brown hen on dry grass"),
    ],
    searchKeywords: ["pullets", "pol", "kuku wa mayai", "layers", "hens"],
    specifications: [
      { label: "Age", value: "About 18 weeks" },
      { label: "Minimum order", value: "10 birds, in multiples of 5" },
    ],
    variants: [
      variant({
        id: "var-pullets",
        name: "Per bird",
        sku: "SAMPLE-POL",
        priceMinor: 85_000,
        unit: "bird",
        minOrderQty: 10,
        orderStep: 5,
        maxOrderQty: 500,
        stockQuantity: 150,
        lowStockThreshold: 30,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-spent-layers",
    slug: "spent-layers",
    name: "Spent layer hens",
    categorySlug: "live-birds",
    shortDescription: "Hens at the end of their laying cycle. Sold per bird, minimum 5.",
    description:
      "SAMPLE PRODUCT. Hens at the end of their laying cycle, sold per bird. Stock depends on our flock replacement schedule.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-07-20T06:00:00Z",
    images: [photo("hens-pasture", "square", "A brown hen on dry grass")],
    searchKeywords: ["kuku", "hens", "layers", "spent hens"],
    specifications: [{ label: "Minimum order", value: "5 birds" }],
    variants: [
      variant({
        id: "var-spent-layers",
        name: "Per bird",
        sku: "SAMPLE-SPENT",
        priceMinor: 45_000,
        unit: "bird",
        minOrderQty: 5,
        stockQuantity: 0,
        lowStockThreshold: 10,
        isDefault: true,
      }),
    ],
  },

  // ---- Feeds & supplies -------------------------------------------------------------------
  {
    id: "prd-layers-mash",
    slug: "layers-mash",
    name: "Layers mash",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Complete feed for laying hens, in 70 kg and 10 kg bags.",
    description:
      "SAMPLE PRODUCT. Complete layers mash for hens in lay. Feed according to the guidance on the bag, with clean water available at all times.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-10-08T06:00:00Z",
    images: noImages,
    searchKeywords: ["chakula cha kuku", "feed", "layers", "mash", "chakula"],
    specifications: [
      { label: "Form", value: "Mash" },
      { label: "For", value: "Laying hens from point of lay" },
    ],
    fixture: { publishedAfterBuild: true },
    variants: [
      variant({
        id: "var-layers-70",
        name: "70 kg bag",
        sku: "SAMPLE-FD-LAY-70",
        priceMinor: 420_000,
        unit: "bag",
        unitDescription: "70 kg",
        maxOrderQty: 20,
        stockQuantity: 25,
        isDefault: true,
      }),
      variant({
        id: "var-layers-10",
        name: "10 kg bag",
        sku: "SAMPLE-FD-LAY-10",
        priceMinor: 72_000,
        unit: "bag",
        unitDescription: "10 kg",
        maxOrderQty: 20,
        stockQuantity: 40,
      }),
    ],
  },
  {
    id: "prd-chick-mash",
    slug: "chick-mash",
    name: "Chick and duck mash",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Starter feed for chicks from day one to about 8 weeks.",
    description:
      "SAMPLE PRODUCT. Starter mash for chicks and ducklings from day one to about 8 weeks, then move to growers mash.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-07-22T06:00:00Z",
    images: noImages,
    searchKeywords: ["chakula", "vifaranga", "starter", "chick mash"],
    specifications: [
      { label: "Form", value: "Mash" },
      { label: "For", value: "Chicks, 0–8 weeks" },
    ],
    variants: [
      variant({
        id: "var-chick-mash-70",
        name: "70 kg bag",
        sku: "SAMPLE-FD-CHK-70",
        priceMinor: 430_000,
        unit: "bag",
        unitDescription: "70 kg",
        maxOrderQty: 20,
        stockQuantity: 18,
        isDefault: true,
      }),
      variant({
        id: "var-chick-mash-10",
        name: "10 kg bag",
        sku: "SAMPLE-FD-CHK-10",
        priceMinor: 74_000,
        unit: "bag",
        unitDescription: "10 kg",
        maxOrderQty: 20,
        stockQuantity: 30,
      }),
    ],
  },
  {
    id: "prd-growers-mash",
    slug: "growers-mash",
    name: "Growers mash",
    categorySlug: "feeds-and-supplies",
    shortDescription: "For growing pullets from about 8 weeks to point of lay.",
    description:
      "SAMPLE PRODUCT. Growers mash for pullets from about 8 weeks until they start laying.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-07-22T06:00:00Z",
    images: noImages,
    searchKeywords: ["chakula", "growers", "pullets"],
    specifications: [
      { label: "Form", value: "Mash" },
      { label: "For", value: "Pullets, about 8–18 weeks" },
    ],
    variants: [
      variant({
        id: "var-growers-70",
        name: "70 kg bag",
        sku: "SAMPLE-FD-GRW-70",
        priceMinor: 390_000,
        unit: "bag",
        unitDescription: "70 kg",
        maxOrderQty: 20,
        stockQuantity: 12,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-broiler-starter",
    slug: "broiler-starter-crumbs",
    name: "Broiler starter crumbs",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Crumbled starter feed for broiler chicks, in 50 kg bags.",
    description:
      "SAMPLE PRODUCT. Crumbled starter feed for broiler chicks in their first weeks, followed by finisher feed.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-09-18T06:00:00Z",
    images: noImages,
    searchKeywords: ["chakula", "broiler", "starter", "crumbs"],
    specifications: [
      { label: "Form", value: "Crumbs" },
      { label: "For", value: "Broiler chicks" },
    ],
    variants: [
      variant({
        id: "var-broiler-starter-50",
        name: "50 kg bag",
        sku: "SAMPLE-FD-BST-50",
        priceMinor: 380_000,
        unit: "bag",
        unitDescription: "50 kg",
        maxOrderQty: 20,
        stockQuantity: 3,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-chick-feeder",
    slug: "chick-feeder",
    name: "Plastic chick feeder (3 kg)",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Round feeder for chicks in the brooder, holds about 3 kg.",
    description:
      "SAMPLE PRODUCT. A round plastic feeder sized for chicks in the brooder. One feeder serves about 50 chicks.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-08-05T06:00:00Z",
    images: noImages,
    searchKeywords: ["feeder", "equipment", "vifaa"],
    specifications: [
      { label: "Capacity", value: "About 3 kg of feed" },
      { label: "Material", value: "Plastic" },
    ],
    variants: [
      variant({
        id: "var-chick-feeder",
        name: "Each",
        sku: "SAMPLE-EQ-FDR-3",
        priceMinor: 35_000,
        unit: "piece",
        stockQuantity: 60,
        lowStockThreshold: 10,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-drinker",
    slug: "poultry-drinker",
    name: "Poultry drinker",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Plastic drinkers in 4 and 10 litre sizes.",
    description:
      "SAMPLE PRODUCT. Easy-to-clean plastic drinkers. Use the 4 litre size for chicks and the 10 litre size for growing and adult birds.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-08-05T06:00:00Z",
    images: noImages,
    searchKeywords: ["drinker", "water", "equipment", "vifaa", "maji"],
    specifications: [{ label: "Material", value: "Plastic" }],
    variants: [
      variant({
        id: "var-drinker-4",
        name: "4 litre",
        sku: "SAMPLE-EQ-DRK-4",
        priceMinor: 25_000,
        unit: "piece",
        stockQuantity: 45,
        isDefault: true,
      }),
      variant({
        id: "var-drinker-10",
        name: "10 litre",
        sku: "SAMPLE-EQ-DRK-10",
        priceMinor: 45_000,
        unit: "piece",
        stockQuantity: 20,
      }),
    ],
  },
  {
    id: "prd-hanging-feeder",
    slug: "hanging-feeder",
    name: "Galvanised hanging feeder (10 kg)",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Hanging tube feeder for growing and adult birds.",
    description:
      "SAMPLE PRODUCT. A hanging tube feeder that reduces feed waste. Adjust the height as your birds grow.",
    purchaseMode: "cart",
    isFeatured: true,
    collectionOnly: false,
    publishedAt: "2026-09-25T06:00:00Z",
    images: [photo("hens-feeder", "square", "Hens around a galvanised hanging feeder")],
    searchKeywords: ["feeder", "equipment", "vifaa"],
    specifications: [
      { label: "Capacity", value: "About 10 kg of feed" },
      { label: "Material", value: "Galvanised steel" },
    ],
    variants: [
      variant({
        id: "var-hanging-feeder",
        name: "Each",
        sku: "SAMPLE-EQ-HFD-10",
        priceMinor: 120_000,
        compareAtPriceMinor: 140_000,
        unit: "piece",
        stockQuantity: 15,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-egg-trays",
    slug: "paper-egg-trays",
    name: "Paper egg trays (pack of 100)",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Moulded paper trays for 30 eggs, in packs of 100.",
    description:
      "SAMPLE PRODUCT. Moulded paper egg trays that hold 30 eggs each. Sold in packs of 100.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: false,
    publishedAt: "2026-08-25T06:00:00Z",
    images: noImages,
    searchKeywords: ["trays", "trei", "packaging"],
    specifications: [{ label: "Pack", value: "100 trays, 30 eggs each" }],
    variants: [
      variant({
        id: "var-egg-trays-100",
        name: "Pack of 100",
        sku: "SAMPLE-EQ-TRAY-100",
        priceMinor: 80_000,
        unit: "pack",
        stockQuantity: 50,
        isDefault: true,
      }),
    ],
  },
  {
    id: "prd-manure",
    slug: "poultry-manure",
    name: "Dried poultry manure",
    categorySlug: "feeds-and-supplies",
    shortDescription: "Dried manure in 50 kg bags for gardens and farms. Pick-up only.",
    description:
      "SAMPLE PRODUCT. Dried poultry manure, bagged at the farm. Collect from the farm; minimum order 2 bags.",
    purchaseMode: "cart",
    isFeatured: false,
    collectionOnly: true,
    publishedAt: "2026-09-05T06:00:00Z",
    images: noImages,
    searchKeywords: ["mbolea", "manure", "fertiliser", "fertilizer", "garden"],
    specifications: [
      { label: "Bag size", value: "About 50 kg" },
      { label: "Collection", value: "At the farm" },
    ],
    variants: [
      variant({
        id: "var-manure-50",
        name: "50 kg bag",
        sku: "SAMPLE-MAN-50",
        priceMinor: 30_000,
        unit: "bag",
        unitDescription: "About 50 kg",
        minOrderQty: 2,
        stockQuantity: 80,
        lowStockThreshold: 10,
        isDefault: true,
      }),
    ],
  },
];
