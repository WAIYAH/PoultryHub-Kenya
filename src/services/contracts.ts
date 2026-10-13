// The seam between UI and data (ARCHITECTURE.md §7.1). Pages and features depend only on these
// interfaces; mock (Phase 2) and Supabase (Phase 3+) implementations are interchangeable.
// Every method rejects with an AppError (src/lib/errors.ts), never a raw provider error.
import type {
  AboutContent,
  Address,
  AddressInput,
  AuthEmailResult,
  BlogPost,
  BlogPostSummary,
  CartQuote,
  CartQuoteInput,
  Category,
  ContactInput,
  DeliveryArea,
  DeliveryZone,
  Faq,
  FaqTopic,
  HomeContent,
  MockPaymentOutcome,
  OrderDetail,
  OrderPaymentStatusView,
  OrderRef,
  OrderSummary,
  OrderTracking,
  Page,
  PageRequest,
  PaymentAttempt,
  PickupLocation,
  PlacedOrder,
  PlaceOrderInput,
  PolicyPage,
  PolicySlug,
  ProductDetail,
  ProductQuery,
  ProductSummary,
  Profile,
  ProfileInput,
  SearchResults,
  ServiceOffering,
  Session,
  SignInInput,
  SignUpInput,
  SiteSettings,
  StartMpesaInput,
  Testimonial,
} from "@/types/domain";

export interface CatalogService {
  listCategories(): Promise<Category[]>;
  listProducts(query?: ProductQuery): Promise<Page<ProductSummary>>;
  getProduct(slug: string): Promise<ProductDetail | null>;
  listRelated(productId: string, limit?: number): Promise<ProductSummary[]>;
}

export interface ContentService {
  getSettings(): Promise<SiteSettings>;
  getHome(): Promise<HomeContent>;
  getAbout(): Promise<AboutContent>;
  /** Only services marked as offered (SITE-06). */
  listServices(): Promise<ServiceOffering[]>;
  listFaqs(filter?: { topic?: FaqTopic; homeOnly?: boolean }): Promise<Faq[]>;
  /** Published testimonials with recorded consent only (BR-31). */
  listTestimonials(): Promise<Testimonial[]>;
  listPosts(query?: PageRequest & { tag?: string }): Promise<Page<BlogPostSummary>>;
  getPost(slug: string): Promise<BlogPost | null>;
  listRelatedPosts(slug: string, limit?: number): Promise<BlogPostSummary[]>;
  getPolicy(slug: PolicySlug): Promise<PolicyPage | null>;
}

export interface DeliveryService {
  listZones(): Promise<DeliveryZone[]>;
  /** Active delivery areas; the UI filters them by county (KM-3). */
  listAreas(): Promise<DeliveryArea[]>;
  listPickupLocations(): Promise<PickupLocation[]>;
}

export interface OrderService {
  /** Authoritative prices, stock checks, discount and delivery fee (CART-04, BR-03). */
  quoteCart(input: CartQuoteInput): Promise<CartQuote>;
  /** Idempotent by `idempotencyKey` (NFR-REL-1). Rejects with PRICE_CHANGED, INSUFFICIENT_STOCK… */
  placeOrder(input: PlaceOrderInput): Promise<PlacedOrder>;
  /** The signed-in owner's order, or a guest order with its secret token (BR-28). */
  getOrder(ref: OrderRef): Promise<OrderDetail | null>;
  /** Status only, never personal data (CHK-07). Null for any mismatch. */
  trackOrder(input: { orderNumber: string; phone: string }): Promise<OrderTracking | null>;
  listMyOrders(page?: PageRequest): Promise<Page<OrderSummary>>;
  /** BR-25: only while pending. */
  cancelPendingOrder(ref: OrderRef): Promise<void>;
}

export interface PaymentService {
  startMpesaPayment(input: StartMpesaInput): Promise<PaymentAttempt>;
  getPaymentStatus(ref: OrderRef): Promise<OrderPaymentStatusView>;
  /** PAY-03: the customer reports a Paybill transaction code for staff to verify. */
  submitPaybillReference(input: OrderRef & { reference: string }): Promise<void>;
  /**
   * Mock payment provider only (API_AND_INTEGRATIONS.md §8): drives a pending attempt to an
   * outcome. Absent whenever real payments are configured, so the UI hides its test controls.
   */
  simulate?: (input: { paymentId: string; outcome: MockPaymentOutcome }) => Promise<void>;
}

export interface AuthService {
  getSession(): Promise<Session | null>;
  /** Subscribes to sign-in and sign-out; returns the unsubscribe function. */
  onSessionChange(listener: (session: Session | null) => void): () => void;
  signIn(input: SignInInput): Promise<Session>;
  /** Creates an unconfirmed account and sends the confirmation email (ACC-01). */
  signUp(input: SignUpInput): Promise<AuthEmailResult>;
  /** Completes a link from an email (confirmation or password reset; PKCE in Phase 3). */
  exchangeCode(code: string): Promise<Session>;
  signOut(options?: { scope: "local" | "global" }): Promise<void>;
  /** Always resolves, whether or not the account exists (no account enumeration). */
  requestPasswordReset(email: string): Promise<AuthEmailResult>;
  updatePassword(password: string): Promise<void>;
}

export interface AccountService {
  getProfile(): Promise<Profile>;
  updateProfile(input: ProfileInput): Promise<Profile>;
  listAddresses(): Promise<Address[]>;
  /** Creates (no id) or updates an address; at most 10, one default (ACC-05). */
  saveAddress(input: AddressInput & { id?: string }): Promise<Address>;
  deleteAddress(id: string): Promise<void>;
}

export interface ContactService {
  submit(input: ContactInput): Promise<void>;
}

export interface SearchService {
  /** Products, blog posts and FAQs, with Swahili synonyms for products (SITE-11, CAT-12). */
  search(query: string): Promise<SearchResults>;
}

export interface Services {
  catalog: CatalogService;
  content: ContentService;
  delivery: DeliveryService;
  orders: OrderService;
  payments: PaymentService;
  auth: AuthService;
  account: AccountService;
  contact: ContactService;
  search: SearchService;
}
