// Domain types used by the UI. Database rows (snake_case) are mapped into these in
// src/services/supabase (Phase 3); fixtures use them directly. Shapes mirror DATABASE.md.

/** Money in minor units (1 KES = 100). Always an integer. */
export type MinorUnits = number;

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

export type SaleUnit =
  "tray" | "crate" | "dozen" | "piece" | "chick" | "bird" | "bag" | "kg" | "litre" | "pack";

export type Availability = "in_stock" | "low_stock" | "out_of_stock" | "pre_order" | "enquiry";

export type PurchaseMode = "cart" | "enquiry";

/** An extra `<source>` for art direction (different crop per screen size) or a newer format. */
export interface ImageSource {
  srcSet: string;
  type?: string;
  media?: string;
  width: number;
  height: number;
}

/** A responsive image. `srcSet` lists the 480/960/1600 px renditions when they exist. */
export interface ImageAsset {
  src: string;
  srcSet?: string;
  alt: string;
  width: number;
  height: number;
  /** Rendered as `<picture>` sources before the `<img>`, e.g. an AVIF hero (DESIGN_SYSTEM.md §8). */
  sources?: ImageSource[];
  /** JPEG rendition for link previews and structured data, where WebP isn't reliably supported. */
  jpegSrc?: string;
}

export type ProductImage = ImageAsset;

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: ImageAsset | null;
  /** Active products in the category (computed by the data source). */
  productCount: number;
  /** Lowest variant price in the category, for "From KSh …" (computed from real prices). */
  fromPriceMinor: MinorUnits | null;
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
  /** True when variants have different prices ("From KSh …"). */
  hasPriceRange: boolean;
  availability: Availability;
  image: ProductImage | null;
  isFeatured: boolean;
  purchaseMode: PurchaseMode;
  /** Default variant's ordering rule, so cards can add the right quantity. */
  defaultVariant: Pick<
    ProductVariant,
    | "id"
    | "name"
    | "priceMinor"
    | "unit"
    | "minOrderQty"
    | "orderStep"
    | "maxOrderQty"
    | "availableFrom"
  > & { available: number | null };
  publishedAt: string;
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
  featured?: boolean;
}

// ---------------------------------------------------------------------------
// Site settings and editable content (site_settings, content_blocks, faqs, …)
// ---------------------------------------------------------------------------

export interface BusinessHours {
  days: string;
  hours: string;
}

export type SocialPlatform = "facebook" | "instagram" | "tiktok" | "youtube" | "x";

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  /** E.164. Null until the business supplies it: UI hides call links. */
  phone: string | null;
  /** E.164. Null until supplied: WhatsApp links fall back to a share link in demo mode only. */
  whatsappPhone: string | null;
  email: string | null;
  location: string | null;
  mapUrl: string | null;
  businessHours: BusinessHours[];
  socialLinks: SocialLink[];
  payments: {
    mpesaStk: boolean;
    mpesaPaybill: boolean;
    payOnDelivery: boolean;
    payOnCollection: boolean;
    /** e.g. "Paybill 000000, account: your order number". */
    paybillDisplay: string | null;
    payOnDeliveryMaxMinor: MinorUnits | null;
  };
  orders: {
    unpaidHoldMinutes: number;
    showLowStockCounts: boolean;
  };
  /** Verified statistics entered by an admin (BR-31). Empty means "show service facts instead". */
  trustStats: { value: string; label: string }[];
  announcement: { id: string; message: string } | null;
}

/** Icons are referenced by key so editable content never stores components. */
export type ContentIcon =
  | "smartphone"
  | "truck"
  | "message"
  | "tag"
  | "egg"
  | "leaf"
  | "shield"
  | "clock"
  | "sun"
  | "scale"
  | "sprout"
  | "handshake"
  | "calendar"
  | "package"
  | "heart";

export interface Cta {
  label: string;
  href: string;
}

export interface IconPoint {
  icon: ContentIcon;
  title: string;
  text?: string;
}

export interface HomeContent {
  hero: {
    chips: string[];
    headline: string;
    highlight: string;
    lead: string;
    primaryCta: Cta;
    secondaryCta: Cta;
    image: ImageAsset | null;
  };
  serviceFacts: IconPoint[];
  about: { eyebrow: string; title: string; body: string; cta: Cta; image: ImageAsset | null };
  eggsPromo: {
    eyebrow: string;
    title: string;
    lead: string;
    badge: string;
    benefits: IconPoint[];
    cta: Cta;
    image: ImageAsset | null;
  };
  practices: {
    eyebrow: string;
    title: string;
    lead: string;
    points: string[];
    cta: Cta;
    image: ImageAsset | null;
  };
  howToOrder: {
    eyebrow: string;
    title: string;
    lead: string;
    steps: { title: string; text: string }[];
  };
  wholesale: {
    eyebrow: string;
    title: string;
    lead: string;
    points: IconPoint[];
    cta: Cta;
    image: ImageAsset | null;
  };
}

export interface AboutContent {
  intro: { title: string; lead: string; image: ImageAsset | null };
  story: { title: string; paragraphs: string[] };
  missionVision: { mission: string; vision: string };
  practices: { title: string; lead: string; points: IconPoint[] };
  commitments: { title: string; points: string[] };
}

export interface ServiceOffering {
  id: string;
  icon: ContentIcon;
  title: string;
  summary: string;
  details: string[];
  cta: Cta;
  /** Only offered services are shown (SITE-06). */
  offered: boolean;
}

export type FaqTopic = "ordering" | "delivery" | "payments" | "products" | "farm" | "wholesale";

export interface Faq {
  id: string;
  question: string;
  answer: string;
  topic: FaqTopic;
  showOnHome: boolean;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorDescriptor: string;
  quote: string;
}

export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: ImageAsset | null;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
}

export interface BlogPost extends BlogPostSummary {
  authorName: string;
  bodyMarkdown: string;
}

export type PolicySlug = "privacy" | "terms" | "delivery-and-returns" | "payments";

export interface PolicyPage {
  slug: PolicySlug;
  title: string;
  summary: string;
  bodyMarkdown: string;
  /** Null until an advocate has reviewed the page (BR-32). */
  lastReviewedAt: string | null;
}

// ---------------------------------------------------------------------------
// Delivery (delivery_zones, delivery_areas, pickup_locations)
// ---------------------------------------------------------------------------

export interface DeliveryZone {
  id: string;
  name: string;
  feeMinor: MinorUnits;
  freeOverMinor: MinorUnits | null;
  minOrderMinor: MinorUnits | null;
  etaMinDays: number;
  etaMaxDays: number;
  /** Human-readable schedule, e.g. "Daily" or "Tuesdays and Fridays". */
  schedule: string;
}

export interface DeliveryArea {
  id: string;
  zoneId: string;
  county: string;
  name: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  county: string;
  town: string;
  addressLine: string;
  directions: string;
  openingHours: BusinessHours[];
  mapUrl: string | null;
}

// ---------------------------------------------------------------------------
// Cart quote (quote_cart RPC)
// ---------------------------------------------------------------------------

export type FulfilmentMethod = "delivery" | "collection";

export interface CartItemInput {
  variantId: string;
  quantity: number;
}

export interface CartQuoteInput {
  items: CartItemInput[];
  fulfilment?: FulfilmentMethod;
  deliveryAreaId?: string | null;
  pickupLocationId?: string | null;
  promoCode?: string | null;
}

export type QuoteLineIssue =
  | { code: "UNAVAILABLE" }
  | { code: "INSUFFICIENT_STOCK"; available: number }
  | { code: "QUANTITY_RULE"; min: number; step: number; max: number | null }
  | { code: "COLLECTION_ONLY" };

export interface QuoteLine {
  variantId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unit: SaleUnit;
  unitPriceMinor: MinorUnits;
  quantity: number;
  lineTotalMinor: MinorUnits;
  image: ProductImage | null;
  rule: { min: number; step: number; max: number | null; available: number | null };
  collectionOnly: boolean;
  issues: QuoteLineIssue[];
}

export type QuoteIssue =
  | { code: "AREA_NOT_SERVED" }
  | { code: "BELOW_MINIMUM_ORDER"; minimumMinor: MinorUnits }
  | { code: "PROMO_INVALID"; reason: string };

export interface CartQuote {
  lines: QuoteLine[];
  subtotalMinor: MinorUnits;
  discountMinor: MinorUnits;
  /** Null until a delivery area is chosen (or for pick-up, 0). */
  deliveryFeeMinor: MinorUnits | null;
  totalMinor: MinorUnits;
  delivery: {
    zoneName: string;
    etaMinDays: number;
    etaMaxDays: number;
    freeOverMinor: MinorUnits | null;
    schedule: string;
  } | null;
  promo: { code: string; description: string } | null;
  issues: QuoteIssue[];
}

// ---------------------------------------------------------------------------
// Orders and payments (orders, order_items, order_events, payments)
// ---------------------------------------------------------------------------

export type PaymentMethod = "mpesa_stk" | "mpesa_paybill" | "pay_on_delivery" | "pay_on_collection";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "ready_for_collection"
  | "dispatched"
  | "completed"
  | "cancelled";

export type OrderPaymentStatus = "unpaid" | "pending" | "paid" | "partially_refunded" | "refunded";

export type PaymentAttemptStatus = "pending" | "succeeded" | "failed" | "cancelled" | "expired";

export interface PlaceOrderInput {
  idempotencyKey: string;
  customer: { name: string; phone: string; email?: string | null };
  items: CartItemInput[];
  fulfilment:
    | {
        method: "delivery";
        deliveryAreaId: string;
        town: string;
        addressLine: string;
        directions?: string | null;
        instructions?: string | null;
      }
    | { method: "collection"; pickupLocationId: string };
  paymentMethod: PaymentMethod;
  promoCode?: string | null;
  note?: string | null;
  expectedTotalMinor: MinorUnits;
}

export interface PlacedOrder {
  orderNumber: string;
  accessToken: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  totalMinor: MinorUnits;
  nextAction: "mpesa_stk" | "await_confirmation" | "paybill_instructions";
  /** Secret guest link, e.g. "/orders/PH001234?token=…" (CHK-06, CHK-07). */
  trackingPath: string;
}

/** How the UI asks for an order: by the signed-in session, or with the guest's secret token. */
export interface OrderRef {
  orderNumber: string;
  token?: string | null;
}

export interface OrderItem {
  /** For "Order again" (CART-08); null once the variant no longer exists. */
  variantId: string | null;
  productSlug: string | null;
  productName: string;
  variantName: string;
  unit: SaleUnit;
  unitPriceMinor: MinorUnits;
  quantity: number;
  lineTotalMinor: MinorUnits;
  image: ProductImage | null;
}

export interface OrderEvent {
  type:
    | "placed"
    | "status_changed"
    | "payment_initiated"
    | "payment_succeeded"
    | "payment_failed"
    | "payment_recorded"
    | "refund_recorded"
    | "delivery_update"
    | "note";
  label: string;
  message?: string;
  at: string;
}

export interface OrderPayment {
  status: PaymentAttemptStatus;
  method: PaymentMethod;
  amountMinor: MinorUnits;
  phone: string | null;
  receipt: string | null;
  resultMessage: string | null;
  at: string;
}

export interface OrderDetail {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  fulfilmentMethod: FulfilmentMethod;
  placedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  items: OrderItem[];
  subtotalMinor: MinorUnits;
  discountMinor: MinorUnits;
  deliveryFeeMinor: MinorUnits;
  totalMinor: MinorUnits;
  promoCode: string | null;
  delivery: {
    county: string;
    town: string;
    addressLine: string;
    directions: string | null;
    instructions: string | null;
    zoneName: string;
    etaMinDays: number;
    etaMaxDays: number;
  } | null;
  pickup: Pick<
    PickupLocation,
    "name" | "addressLine" | "directions" | "openingHours" | "mapUrl"
  > | null;
  note: string | null;
  events: OrderEvent[];
  payments: OrderPayment[];
  /** When an unpaid M-Pesa order's stock hold expires (BR-09). */
  reservedUntil: string | null;
  /** Present for guests so the page can show a copyable tracking link. */
  accessToken: string | null;
}

export interface OrderSummary {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  fulfilmentMethod: FulfilmentMethod;
  totalMinor: MinorUnits;
  placedAt: string;
  itemCount: number;
  previewNames: string[];
}

/** Status-only view for the public Track Order form: never any personal data (CHK-07). */
export interface OrderTracking {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  fulfilmentMethod: FulfilmentMethod;
  events: Pick<OrderEvent, "label" | "at">[];
}

export interface StartMpesaInput {
  orderNumber: string;
  token?: string | null;
  phone: string;
  idempotencyKey: string;
}

export interface PaymentAttempt {
  id: string;
  status: PaymentAttemptStatus;
  customerMessage: string;
}

export interface OrderPaymentStatusView {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  latestAttempt: {
    id: string;
    status: PaymentAttemptStatus;
    resultMessage: string | null;
    at: string;
  } | null;
  reservedUntil: string | null;
}

/** Outcomes the mock payment provider can simulate (API_AND_INTEGRATIONS.md §5.2, §8). */
export type MockPaymentOutcome =
  "success" | "cancelled" | "insufficient_funds" | "timeout" | "late_success";

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

export interface Session {
  user: SessionUser;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  marketingOptIn: boolean;
}

export interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  county: string;
  deliveryAreaId: string | null;
  town: string;
  addressLine: string;
  directions: string | null;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, "id" | "isDefault"> & { isDefault?: boolean };

export type ProfileInput = Pick<Profile, "fullName" | "phone" | "marketingOptIn">;

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  marketingOptIn: boolean;
}

/** Result of an action that sends an email (confirmation, password reset). */
export interface AuthEmailResult {
  email: string;
  /** Mock data source only: the link the email would contain, so the demo can follow it. */
  demoLink?: string;
}

// ---------------------------------------------------------------------------
// Contact and search
// ---------------------------------------------------------------------------

export type ContactSubject =
  "general" | "order_help" | "wholesale_quote" | "farm_visit" | "feedback" | "other";

export interface ContactInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  subject: ContactSubject;
  message: string;
  orderNumber?: string | null;
}

export interface SearchResults {
  query: string;
  products: ProductSummary[];
  posts: BlogPostSummary[];
  faqs: Faq[];
}
