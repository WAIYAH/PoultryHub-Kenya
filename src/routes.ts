import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

// The single source of truth for URLs (ARCHITECTURE.md §6). Pages not built yet share the
// placeholder module, each with its own id (see src/config/pages.ts). Every static path must also
// be classified in src/config/prerender.ts, or the build fails.

const PLACEHOLDER = "routes/system/placeholder.tsx";
const page = (path: string, id: string) => route(path, PLACEHOLDER, { id });
// One module serves all four policy pages; it reads the slug from the URL.
const POLICY = "routes/public/policy.tsx";

// Development and staging builds only; never shipped to production (ARCHITECTURE.md §6.1).
const includeDesignSystem = process.env.VITE_APP_ENV !== "production";

export default [
  layout("layouts/public-layout.tsx", [
    index("routes/public/home.tsx"),
    route("shop", "routes/public/shop.tsx"),
    route("shop/:categorySlug", "routes/public/category.tsx"),
    route("products/:productSlug", "routes/public/product.tsx"),
    route("search", "routes/public/search.tsx"),
    route("cart", "routes/public/cart.tsx"),
    route("orders/:orderNumber", "routes/public/order.tsx"),
    route("track-order", "routes/public/track-order.tsx"),
    route("about", "routes/public/about.tsx"),
    route("services", "routes/public/services.tsx"),
    route("contact", "routes/public/contact.tsx"),
    route("faq", "routes/public/faq.tsx"),
    route("blog", "routes/public/blog.tsx"),
    route("blog/:postSlug", "routes/public/blog-post.tsx"),
    ...prefix("policies", [
      route("privacy", POLICY, { id: "policy-privacy" }),
      route("terms", POLICY, { id: "policy-terms" }),
      route("delivery-and-returns", POLICY, { id: "policy-delivery" }),
      route("payments", POLICY, { id: "policy-payments" }),
    ]),
    ...prefix("auth", [
      route("sign-in", "routes/auth/sign-in.tsx"),
      route("sign-up", "routes/auth/sign-up.tsx"),
      route("forgot-password", "routes/auth/forgot-password.tsx"),
      route("reset-password", "routes/auth/reset-password.tsx"),
      route("callback", "routes/auth/callback.tsx"),
    ]),
    layout("layouts/account-layout.tsx", [
      ...prefix("account", [
        index("routes/account/overview.tsx"),
        route("orders", "routes/account/orders.tsx"),
        route("profile", "routes/account/profile.tsx"),
        route("addresses", "routes/account/addresses.tsx"),
        route("security", "routes/account/security.tsx"),
      ]),
    ]),
    route("access-denied", "routes/system/access-denied.tsx"),
    route("*", "routes/system/not-found.tsx"),
  ]),

  layout("layouts/checkout-layout.tsx", [route("checkout", "routes/public/checkout.tsx")]),

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
