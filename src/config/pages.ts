// Registry of pages that are scaffolded but not yet built. The shared placeholder route uses it
// for titles; each entry is removed when its real route module lands (TASKS.md).

export type DeliveryPhase = 2 | 3 | 4 | 5;

export interface PageInfo {
  title: string;
  summary: string;
  phase: DeliveryPhase;
}

export const pageRegistry = {
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
