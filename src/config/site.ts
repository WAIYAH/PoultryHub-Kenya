// Brand and navigation config. Business facts (phone, WhatsApp, hours…) live in site settings
// (`ContentService.getSettings`), not here, and stay null until the business supplies them.

export const site = {
  /** Working trading name (PLAN.md decision D2); confirm before launch. */
  name: "PoultryHub Kenya",
  shortName: "PoultryHub",
  description:
    "Fresh eggs, day-old chicks, live birds and farm supplies from a Kenyan poultry farm. Order online for delivery or pick-up.",
  locale: "en-KE",
  timeZone: "Africa/Nairobi",
  currency: "KES",
  /** Default link-preview image (1200×630 JPEG). Illustrative until real photos arrive (A-15). */
  ogImage: {
    url: "/images/photos/kenya-hen-chicks-og-1200.jpg",
    alt: "A hen with her young chicks in a grassy yard",
  },
} as const;

export interface NavLink {
  label: string;
  href: string;
}

export const mainNav: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const quoteLink: NavLink = {
  label: "Get a quote",
  href: "/contact?subject=wholesale_quote",
};

export const footerNav: Record<
  "shop" | "company" | "help" | "policies",
  { title: string; links: NavLink[] }
> = {
  shop: {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Eggs", href: "/shop/eggs" },
      { label: "Day-old chicks", href: "/shop/day-old-chicks" },
      { label: "Live birds", href: "/shop/live-birds" },
      { label: "Feeds & supplies", href: "/shop/feeds-and-supplies" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  help: {
    title: "Help",
    links: [
      { label: "Track an order", href: "/track-order" },
      { label: "FAQs", href: "/faq" },
      { label: "My account", href: "/account" },
    ],
  },
  policies: {
    title: "Policies",
    links: [
      { label: "Privacy", href: "/policies/privacy" },
      { label: "Terms", href: "/policies/terms" },
      { label: "Delivery & returns", href: "/policies/delivery-and-returns" },
      { label: "Payments", href: "/policies/payments" },
    ],
  },
};
