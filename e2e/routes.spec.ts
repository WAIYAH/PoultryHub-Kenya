import { expect, test } from "@playwright/test";

import { expectNoHorizontalScroll, trackPageErrors } from "./support";

// Every route in ARCHITECTURE.md §6 renders a heading, without errors or horizontal scroll
// (Phase 1 exit criteria; the link crawl in Phase 2 extends this to every rendered link).
const routes = [
  "/",
  "/shop",
  "/shop/eggs",
  "/products/farm-fresh-eggs",
  "/products/improved-kienyeji-chicks",
  "/search",
  "/cart",
  "/checkout",
  "/orders/PH001234",
  "/track-order",
  "/about",
  "/services",
  "/contact",
  "/faq",
  "/blog",
  "/blog/sample-article",
  "/policies/privacy",
  "/policies/terms",
  "/policies/delivery-and-returns",
  "/policies/payments",
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/callback",
  "/account",
  "/account/orders",
  "/account/profile",
  "/account/addresses",
  "/account/security",
  "/access-denied",
  "/admin",
  "/admin/orders",
  "/admin/orders/PH001234",
  "/admin/products",
  "/admin/products/new",
  "/admin/products/sample-id",
  "/admin/categories",
  "/admin/inventory",
  "/admin/inventory/movements",
  "/admin/customers",
  "/admin/customers/sample-id",
  "/admin/payments",
  "/admin/payments/sample-id",
  "/admin/promotions",
  "/admin/delivery",
  "/admin/content",
  "/admin/content/faqs",
  "/admin/content/testimonials",
  "/admin/content/pages",
  "/admin/blog",
  "/admin/blog/new",
  "/admin/blog/sample-id",
  "/admin/messages",
  "/admin/reports",
  "/admin/settings",
  "/admin/settings/team",
  "/admin/audit-log",
  "/dev/design-system",
];

for (const path of routes) {
  test(`renders ${path}`, async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto(path);
    await expect(page.locator("h1").first()).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });
}
