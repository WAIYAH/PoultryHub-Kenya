import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

// The single source of truth for URLs (ARCHITECTURE.md §6). Pages not built yet share the
// placeholder module, each with its own id (see src/config/pages.ts). Every static path must also
// be classified in src/config/prerender.ts, or the build fails.

const PLACEHOLDER = "routes/system/placeholder.tsx";
const page = (path: string, id: string) => route(path, PLACEHOLDER, { id });

// Development and staging builds only; never shipped to production (ARCHITECTURE.md §6.1).
const includeDesignSystem = process.env.VITE_APP_ENV !== "production";

export default [
  layout("layouts/public-layout.tsx", [
    index("routes/public/home.tsx"),
    route("shop", "routes/public/shop.tsx"),
    route("shop/:categorySlug", "routes/public/category.tsx"),
    route("products/:productSlug", "routes/public/product.tsx"),
    page("search", "search"),
    route("cart", "routes/public/cart.tsx"),
    page("orders/:orderNumber", "order"),
    page("track-order", "track-order"),
    page("about", "about"),
    page("services", "services"),
    page("contact", "contact"),
    page("faq", "faq"),
    page("blog", "blog"),
    page("blog/:postSlug", "blog-post"),
    ...prefix("policies", [
      page("privacy", "policy-privacy"),
      page("terms", "policy-terms"),
      page("delivery-and-returns", "policy-delivery"),
      page("payments", "policy-payments"),
    ]),
    ...prefix("auth", [
      page("sign-in", "auth-sign-in"),
      page("sign-up", "auth-sign-up"),
      page("forgot-password", "auth-forgot-password"),
      page("reset-password", "auth-reset-password"),
      page("callback", "auth-callback"),
    ]),
    layout("layouts/account-layout.tsx", [
      ...prefix("account", [
        index(PLACEHOLDER, { id: "account" }),
        page("orders", "account-orders"),
        page("profile", "account-profile"),
        page("addresses", "account-addresses"),
        page("security", "account-security"),
      ]),
    ]),
    route("access-denied", "routes/system/access-denied.tsx"),
    route("*", "routes/system/not-found.tsx"),
  ]),

  layout("layouts/checkout-layout.tsx", [page("checkout", "checkout")]),

  ...prefix("admin", [
    layout("layouts/admin-layout.tsx", [
      index(PLACEHOLDER, { id: "admin-overview" }),
      page("orders", "admin-orders"),
      page("orders/:orderNumber", "admin-order"),
      page("products", "admin-products"),
      page("products/new", "admin-product-new"),
      page("products/:productId", "admin-product"),
      page("categories", "admin-categories"),
      page("inventory", "admin-inventory"),
      page("inventory/movements", "admin-inventory-movements"),
      page("customers", "admin-customers"),
      page("customers/:customerId", "admin-customer"),
      page("payments", "admin-payments"),
      page("payments/:paymentId", "admin-payment"),
      page("promotions", "admin-promotions"),
      page("delivery", "admin-delivery"),
      page("content", "admin-content"),
      page("content/faqs", "admin-content-faqs"),
      page("content/testimonials", "admin-content-testimonials"),
      page("content/pages", "admin-content-pages"),
      page("blog", "admin-blog"),
      page("blog/new", "admin-blog-new"),
      page("blog/:postId", "admin-blog-post"),
      page("messages", "admin-messages"),
      page("reports", "admin-reports"),
      page("settings", "admin-settings"),
      page("settings/team", "admin-team"),
      page("audit-log", "admin-audit-log"),
    ]),
  ]),

  route("sitemap.xml", "routes/system/sitemap.ts"),
  route("robots.txt", "routes/system/robots.ts"),

  ...(includeDesignSystem ? [route("dev/design-system", "routes/dev/design-system.tsx")] : []),
] satisfies RouteConfig;
