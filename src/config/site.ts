// Brand and navigation config. Business facts that the business hasn't supplied yet are `null`
// on purpose: components hide what isn't configured instead of inventing it (REQUIREMENTS.md BR-31).

export const site = {
  /** Working trading name (PLAN.md decision D2); confirm before launch. */
  name: "PoultryHub Kenya",
  shortName: "PoultryHub",
  description:
    "Fresh eggs, day-old chicks, live birds and farm supplies from a Kenyan poultry farm. Order online for delivery or pick-up.",
  locale: "en-KE",
  timeZone: "Africa/Nairobi",
  currency: "KES",
} as const;

export interface BusinessContact {
  /** E.164, e.g. +254712345678 */
  phone: string | null;
  /** E.164 number used for wa.me links */
  whatsapp: string | null;
  email: string | null;
  location: string | null;
  hours: string | null;
}

/** Replaced by `site_settings` from the database in Phase 3. */
export const businessContact: BusinessContact = {
  phone: null,
  whatsapp: null,
  email: null,
  location: null,
  hours: null,
};

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
