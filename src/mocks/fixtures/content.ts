// SAMPLE DATA: editable site content for the demo. Copy avoids unverifiable claims (BR-31): no
// statistics, certifications or testimonials until the business supplies and verifies them.
// Contact details stay null until supplied, so the UI hides them instead of inventing them.
import type {
  AboutContent,
  Faq,
  HomeContent,
  ServiceOffering,
  SiteSettings,
  Testimonial,
} from "@/types/domain";

export const siteSettings: SiteSettings = {
  businessName: "PoultryHub Kenya",
  tagline: "Fresh eggs, chicks and farm supplies",
  phone: null,
  whatsappPhone: null,
  email: null,
  location: null,
  mapUrl: null,
  businessHours: [
    { days: "Monday to Saturday", hours: "7:00 am – 6:00 pm" },
    { days: "Sunday and public holidays", hours: "Closed" },
  ],
  socialLinks: [],
  payments: {
    mpesaStk: true,
    mpesaPaybill: true,
    payOnDelivery: true,
    payOnCollection: true,
    paybillDisplay: "Paybill 000000 (sample), account: your order number",
    payOnDeliveryMaxMinor: 1_500_000,
  },
  orders: { unpaidHoldMinutes: 30, showLowStockCounts: true },
  trustStats: [],
  announcement: {
    id: "sample-cutoff-2026-10",
    message: "Sample notice: orders placed after 4 pm go out on the next delivery day.",
  },
};

export const homeContent: HomeContent = {
  hero: {
    chips: ["Fresh eggs", "Healthy birds", "Farm supplies"],
    headline: "Quality poultry,",
    highlight: "straight from the farm",
    lead: "Order eggs, day-old chicks, live birds and farm supplies online. Pay with M-Pesa or on delivery, or pick up at the farm.",
    primaryCta: { label: "Shop now", href: "/shop" },
    secondaryCta: { label: "Chat on WhatsApp", href: "/contact" },
    image: null,
  },
  serviceFacts: [
    { icon: "smartphone", title: "Pay with M-Pesa", text: "Or pay on delivery or at pick-up." },
    {
      icon: "truck",
      title: "Delivery or pick-up",
      text: "To served areas, or collect at the farm.",
    },
    { icon: "message", title: "Help on WhatsApp", text: "Ask about products and orders." },
    { icon: "tag", title: "Clear prices", text: "In KSh, per tray, chick or bag." },
  ],
  about: {
    eyebrow: "About the farm",
    title: "A family poultry farm serving homes, farmers and businesses",
    body: "Sample story: we keep layers, broilers and improved kienyeji birds, and sell eggs, chicks and birds directly to the people who use them. Ordering online simply makes it easier to plan, pay and collect.",
    cta: { label: "Our story", href: "/about" },
    image: null,
  },
  eggsPromo: {
    eyebrow: "Fresh eggs",
    title: "Eggs for the week, delivered",
    lead: "Order by the tray, or set up a regular supply for your shop or kitchen.",
    badge: "Farm fresh",
    benefits: [
      { icon: "egg", title: "Collected daily" },
      { icon: "scale", title: "Graded by size" },
      { icon: "package", title: "Trays of 30" },
      { icon: "truck", title: "Delivered or picked up" },
    ],
    cta: { label: "Order eggs", href: "/shop/eggs" },
    image: null,
  },
  practices: {
    eyebrow: "How we farm",
    title: "Simple, careful routines every day",
    lead: "Sample practices, to be replaced with the farm's own description before launch.",
    points: [
      "Clean water and fresh feed every day",
      "Vaccinations on a schedule agreed with our vet",
      "Eggs collected, graded and packed by hand",
      "Biosecurity at the farm gate and in every house",
    ],
    cta: { label: "Read more about us", href: "/about" },
    image: null,
  },
  howToOrder: {
    eyebrow: "How ordering works",
    title: "Three steps from cart to kitchen",
    lead: "Prices, delivery fees and timings are shown before you pay.",
    steps: [
      {
        title: "Choose",
        text: "Pick your products and quantities. Minimum orders are shown up front.",
      },
      {
        title: "Pay with M-Pesa or later",
        text: "Pay with an M-Pesa prompt, or pay on delivery or at pick-up.",
      },
      {
        title: "Delivered or picked up",
        text: "We deliver to served areas on set days, or you collect at the farm.",
      },
    ],
  },
  wholesale: {
    eyebrow: "Bulk & wholesale",
    title: "Supplying a hotel, school or shop?",
    lead: "Get a quote for regular eggs, birds or chicks, with delivery days that suit you.",
    points: [
      { icon: "calendar", title: "Regular supply", text: "Weekly or twice-weekly deliveries." },
      { icon: "tag", title: "Volume pricing", text: "Quoted per tray or per bird." },
      { icon: "handshake", title: "One contact", text: "A named person for your orders." },
    ],
    cta: { label: "Request a quote", href: "/contact?subject=wholesale_quote" },
    image: null,
  },
};

export const aboutContent: AboutContent = {
  intro: {
    title: "About PoultryHub Kenya",
    lead: "Sample introduction: a Kenyan poultry farm selling eggs, chicks, birds and supplies directly to households, farmers and businesses.",
    image: null,
  },
  story: {
    title: "Our story",
    paragraphs: [
      "Sample paragraph: this is where the business tells how the farm started, who runs it and where it is. The real story replaces this text before launch.",
      "Sample paragraph: many of our customers are small-scale farmers who buy chicks and feeds from us, and households who buy eggs every week. Selling online lets them see prices and availability, and order without a phone call.",
    ],
  },
  missionVision: {
    mission:
      "Sample mission: to supply fresh, fairly priced poultry products and honest advice to the people who depend on them.",
    vision:
      "Sample vision: a farm that customers trust for quality and reliability, year after year.",
  },
  practices: {
    title: "How we farm",
    lead: "Sample practices. The business confirms each one before launch.",
    points: [
      { icon: "leaf", title: "Feed and water", text: "Fresh feed and clean water every day." },
      {
        icon: "shield",
        title: "Bird health",
        text: "Vaccinations on a schedule agreed with our vet.",
      },
      {
        icon: "sun",
        title: "Housing",
        text: "Ventilated houses with space for the birds to move.",
      },
      {
        icon: "egg",
        title: "Egg handling",
        text: "Collected daily, graded by size, packed in trays.",
      },
    ],
  },
  commitments: {
    title: "Our commitments",
    points: [
      "Prices in KSh, with units and minimum orders shown before you order",
      "No payment is taken until you confirm it on your own phone",
      "Clear delivery days and fees for each area we serve",
      "Help on WhatsApp or by phone when something isn't right",
    ],
  },
};

export const serviceOfferings: ServiceOffering[] = [
  {
    id: "svc-eggs",
    icon: "egg",
    title: "Fresh eggs",
    summary: "Table eggs and kienyeji eggs by the tray, for homes and businesses.",
    details: ["Trays of 30, or half trays of kienyeji eggs", "Delivered on set days, or picked up"],
    cta: { label: "Shop eggs", href: "/shop/eggs" },
    offered: true,
  },
  {
    id: "svc-chicks",
    icon: "sprout",
    title: "Day-old chicks",
    summary: "Layer, broiler and improved kienyeji chicks from scheduled batches.",
    details: ["Minimum orders per batch", "Collected at the farm on the batch date"],
    cta: { label: "Shop chicks", href: "/shop/day-old-chicks" },
    offered: true,
  },
  {
    id: "svc-birds",
    icon: "heart",
    title: "Live birds and pullets",
    summary: "Broilers by weight band, kienyeji cockerels and point-of-lay pullets.",
    details: ["Priced per bird", "Pullets from 10 birds"],
    cta: { label: "Shop live birds", href: "/shop/live-birds" },
    offered: true,
  },
  {
    id: "svc-wholesale",
    icon: "handshake",
    title: "Bulk and wholesale supply",
    summary: "Volume pricing for hotels, restaurants, schools and shops.",
    details: ["Quotes per tray or per bird", "Regular delivery days"],
    cta: { label: "Request a quote", href: "/contact?subject=wholesale_quote" },
    offered: true,
  },
  {
    id: "svc-recurring",
    icon: "calendar",
    title: "Recurring supply",
    summary: "A standing weekly order so you never run out.",
    details: ["Weekly or twice-weekly", "Change or pause by message"],
    cta: { label: "Ask about a regular order", href: "/contact?subject=wholesale_quote" },
    offered: true,
  },
  {
    id: "svc-guidance",
    icon: "leaf",
    title: "Farming guidance",
    summary: "Practical advice when you buy chicks, pullets or feeds from us.",
    details: ["Brooding and feeding tips", "Articles on our blog"],
    cta: { label: "Read the blog", href: "/blog" },
    offered: true,
  },
  {
    id: "svc-delivery",
    icon: "truck",
    title: "Delivery and pick-up",
    summary: "Delivery to served areas on set days, or pick-up at the farm.",
    details: ["Fees shown at checkout", "Pick-up points with opening hours"],
    cta: { label: "Delivery details", href: "/policies/delivery-and-returns" },
    offered: true,
  },
  {
    id: "svc-training",
    icon: "clock",
    title: "Farm visits and training days",
    summary: "Not offered yet. Hidden from the Services page until it is (SITE-06).",
    details: [],
    cta: { label: "Contact us", href: "/contact" },
    offered: false,
  },
];

const faq = (
  id: string,
  topic: Faq["topic"],
  question: string,
  answer: string,
  showOnHome = false,
): Faq => ({ id, topic, question, answer, showOnHome });

export const faqs: Faq[] = [
  faq(
    "faq-how-order",
    "ordering",
    "How do I place an order?",
    "Add products to your cart, then check out with your name, phone number and delivery or pick-up details. You can order as a guest or with an account.",
    true,
  ),
  faq(
    "faq-minimum",
    "ordering",
    "Why do some products have a minimum order?",
    "Chicks, pullets and bulk eggs are prepared in batches, so they have a minimum quantity and are sold in steps (for example, chicks from 50, in multiples of 10). The product page always shows the rule.",
  ),
  faq(
    "faq-change-order",
    "ordering",
    "Can I change my order after placing it?",
    "While your order is still pending you can cancel it from the order page and place a new one. After that, contact us on WhatsApp or by phone with your order number.",
  ),
  faq(
    "faq-delivery-areas",
    "delivery",
    "Where do you deliver?",
    "We deliver to the areas listed at checkout, on the days shown for each area. If your area isn't listed, choose pick-up or message us on WhatsApp.",
    true,
  ),
  faq(
    "faq-delivery-fee",
    "delivery",
    "How much is delivery?",
    "The fee depends on your area and is shown before you pay. Some areas have free delivery above a certain order value.",
  ),
  faq(
    "faq-chicks-pickup",
    "delivery",
    "Why are chicks pick-up only?",
    "Day-old chicks travel best over short distances and in the right conditions, so we hand them over at the farm on the batch date. Bring a ventilated box.",
  ),
  faq(
    "faq-mpesa",
    "payments",
    "How does paying with M-Pesa work?",
    "After you place the order, we send a payment prompt to the phone number you choose. Enter your M-Pesa PIN on your phone to pay. We will never ask for your PIN by call or SMS.",
    true,
  ),
  faq(
    "faq-pay-later",
    "payments",
    "Can I pay on delivery or at pick-up?",
    "Yes. Choose pay on delivery or pay at pick-up at checkout, where available. We'll confirm the order with you before we prepare it.",
  ),
  faq(
    "faq-fresh",
    "products",
    "How fresh are the eggs?",
    "Eggs are collected daily and packed in trays. Keep them cool and dry, pointed end down, and wash them only just before use.",
    true,
  ),
  faq(
    "faq-weight-band",
    "products",
    "How are live broilers priced?",
    "Per bird, by the weight band you choose. The price is fixed when you order; we don't re-weigh at delivery.",
  ),
  faq(
    "faq-visit",
    "farm",
    "Can I visit the farm?",
    "Pick-ups happen at the farm gate during opening hours. For other visits, please contact us first so we can keep the birds safe from disease.",
  ),
  faq(
    "faq-wholesale",
    "wholesale",
    "Do you supply businesses?",
    "Yes. Hotels, restaurants, schools and shops can order in bulk or set up a regular supply. Request a quote and we'll get back to you.",
    true,
  ),
];

/** Empty by default: testimonials appear only with recorded consent (BR-31, P2-01). */
export const testimonials: Testimonial[] = [];
