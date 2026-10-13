// Registry of pages that are scaffolded but not yet built. The shared placeholder route uses it
// for titles; each entry is removed when its real route module lands (TASKS.md).

export type DeliveryPhase = 2 | 3 | 4 | 5;

export interface PageInfo {
  title: string;
  summary: string;
  phase: DeliveryPhase;
}

export const pageRegistry = {
  shop: { title: "Shop", summary: "All products with search, filters and sorting.", phase: 2 },
  category: { title: "Category", summary: "Products in one category.", phase: 2 },
  search: { title: "Search", summary: "Results across products, articles and FAQs.", phase: 2 },
  cart: { title: "Cart", summary: "Your cart, saved on this device.", phase: 2 },
  checkout: { title: "Checkout", summary: "Delivery or pick-up, then payment.", phase: 2 },
  order: {
    title: "Order status",
    summary: "Confirmation, payment and tracking for an order.",
    phase: 2,
  },
  "track-order": {
    title: "Track an order",
    summary: "Find an order with its number and phone.",
    phase: 2,
  },
  about: { title: "About us", summary: "Our story, farming methods and standards.", phase: 2 },
  services: { title: "Services", summary: "Supply, bulk orders and farming guidance.", phase: 2 },
  contact: { title: "Contact us", summary: "Phone, WhatsApp, email and a contact form.", phase: 2 },
  faq: { title: "FAQs", summary: "Answers about ordering, delivery and payments.", phase: 2 },
  blog: { title: "Blog", summary: "Poultry farming tips and product guides.", phase: 2 },
  "blog-post": { title: "Article", summary: "A blog article.", phase: 2 },
  "policy-privacy": { title: "Privacy policy", summary: "How we handle personal data.", phase: 2 },
  "policy-terms": { title: "Terms and conditions", summary: "Terms of sale.", phase: 2 },
  "policy-delivery": {
    title: "Delivery and returns",
    summary: "Delivery areas, pick-up and returns.",
    phase: 2,
  },
  "policy-payments": {
    title: "Payment information",
    summary: "M-Pesa and other payment options.",
    phase: 2,
  },
  "auth-sign-in": { title: "Sign in", summary: "Sign in to your account.", phase: 2 },
  "auth-sign-up": {
    title: "Create an account",
    summary: "Register to track orders faster.",
    phase: 2,
  },
  "auth-forgot-password": {
    title: "Forgot password",
    summary: "Get a password reset link.",
    phase: 2,
  },
  "auth-reset-password": { title: "Reset password", summary: "Choose a new password.", phase: 2 },
  "auth-callback": { title: "Signing you in", summary: "Completing sign-in.", phase: 3 },
  account: { title: "My account", summary: "Recent orders and quick actions.", phase: 2 },
  "account-orders": { title: "My orders", summary: "Order history.", phase: 2 },
  "account-profile": { title: "Profile", summary: "Name, phone and preferences.", phase: 2 },
  "account-addresses": { title: "Addresses", summary: "Saved delivery addresses.", phase: 2 },
  "account-security": {
    title: "Security",
    summary: "Password and sign-out from all devices.",
    phase: 2,
  },
  "admin-overview": {
    title: "Overview",
    summary: "Sales, orders and stock at a glance.",
    phase: 5,
  },
  "admin-orders": { title: "Orders", summary: "Find and process orders.", phase: 5 },
  "admin-order": { title: "Order details", summary: "Process one order.", phase: 5 },
  "admin-products": { title: "Products", summary: "Catalogue management.", phase: 5 },
  "admin-product-new": { title: "New product", summary: "Create a product.", phase: 5 },
  "admin-product": { title: "Edit product", summary: "Edit a product.", phase: 5 },
  "admin-categories": { title: "Categories", summary: "Product categories.", phase: 5 },
  "admin-inventory": { title: "Inventory", summary: "Stock levels and adjustments.", phase: 5 },
  "admin-inventory-movements": { title: "Stock movements", summary: "The stock ledger.", phase: 5 },
  "admin-customers": { title: "Customers", summary: "Customer accounts.", phase: 5 },
  "admin-customer": { title: "Customer details", summary: "One customer.", phase: 5 },
  "admin-payments": { title: "Payments", summary: "Payments and review queues.", phase: 5 },
  "admin-payment": { title: "Payment details", summary: "One payment.", phase: 5 },
  "admin-promotions": { title: "Promotions", summary: "Discount codes.", phase: 5 },
  "admin-delivery": { title: "Delivery", summary: "Zones, areas and pick-up points.", phase: 5 },
  "admin-content": { title: "Content", summary: "Home page and site content.", phase: 5 },
  "admin-content-faqs": { title: "FAQs", summary: "Frequently asked questions.", phase: 5 },
  "admin-content-testimonials": {
    title: "Testimonials",
    summary: "Consented testimonials.",
    phase: 5,
  },
  "admin-content-pages": {
    title: "Policy pages",
    summary: "Privacy, terms and other pages.",
    phase: 5,
  },
  "admin-blog": { title: "Blog", summary: "Articles.", phase: 5 },
  "admin-blog-new": { title: "New article", summary: "Write an article.", phase: 5 },
  "admin-blog-post": { title: "Edit article", summary: "Edit an article.", phase: 5 },
  "admin-messages": { title: "Messages", summary: "Contact form inbox.", phase: 5 },
  "admin-reports": { title: "Reports", summary: "Sales and inventory reports.", phase: 5 },
  "admin-settings": { title: "Settings", summary: "Business and order settings.", phase: 5 },
  "admin-team": { title: "Team", summary: "Staff and roles.", phase: 5 },
  "admin-audit-log": { title: "Audit log", summary: "Privileged actions.", phase: 5 },
} as const satisfies Record<string, PageInfo>;

export type PageId = keyof typeof pageRegistry;

export function getPageInfo(id: string | undefined): PageInfo | undefined {
  return id !== undefined && id in pageRegistry ? pageRegistry[id as PageId] : undefined;
}
