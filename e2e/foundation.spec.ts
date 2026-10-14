import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalScroll,
  expectNoSeriousA11yViolations,
  trackPageErrors,
  waitForHydration,
} from "./support";

// Phase 1 exit criteria (PLAN.md §4) and spikes S1–S3 (ARCHITECTURE.md §14.2).

test.describe("foundation", () => {
  test("home renders the hero, demo banner and footer without errors", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/");
    await waitForHydration(page);

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Quality poultry");
    await expect(page.getByTestId("demo-mode-banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  for (const path of [
    "/",
    "/dev/design-system",
    "/about",
    "/products/farm-fresh-eggs",
    "/admin",
    "/no-such-page",
  ]) {
    test(`no serious accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await waitForHydration(page);
      await expectNoSeriousA11yViolations(page);
    });
  }

  test("the skip link moves focus to the main content", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("the mobile menu works by keyboard and returns focus", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The menu button is only shown below the lg breakpoint.");
    await page.goto("/");
    await waitForHydration(page);

    const button = page.getByTestId("mobile-menu-button");
    await button.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Shop" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(button).toBeFocused();
  });

  test("desktop navigation announces the new page and focuses its heading", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "The inline navigation is shown from the lg breakpoint.");
    await page.goto("/");
    await waitForHydration(page);

    await page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link", { name: "About" })
      .click();
    const heading = page.getByRole("heading", { level: 1, name: "About PoultryHub Kenya" });
    await expect(heading).toBeFocused();
    await expect(page.getByTestId("route-announcer")).toHaveText(/About us/);
  });

  test("unknown URLs show the 404 page and are not indexable", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find that page" }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, nofollow",
    );
  });
});

test.describe("spike S1: pre-rendered and fallback product pages", () => {
  test("pre-rendered product HTML contains the product and its structured data", async ({
    request,
  }) => {
    const html = await (await request.get("/products/farm-fresh-eggs")).text();
    expect(html).toContain("Farm fresh eggs");
    expect(html).toContain('"@type":"Product"');
    expect(html).toContain(
      '<link rel="canonical" href="http://127.0.0.1:4173/products/farm-fresh-eggs"/>',
    );
  });

  test("a product published after the build is served by the fallback and still renders", async ({
    page,
    request,
  }) => {
    const html = await (await request.get("/products/layers-mash")).text();
    expect(html).not.toContain("Layers mash");

    const errors = trackPageErrors(page);
    await page.goto("/products/layers-mash");
    await expect(page.getByRole("heading", { level: 1, name: "Layers mash" })).toBeVisible();
    await expect(page).toHaveTitle("Layers mash | PoultryHub Kenya");
    expect(errors).toEqual([]);
  });

  test("client navigation reaches both kinds of product page without a reload", async ({
    page,
  }) => {
    await page.goto("/dev/design-system");
    await waitForHydration(page);
    await page.evaluate(() => {
      (window as unknown as { noReload: boolean }).noReload = true;
    });

    await page.getByRole("link", { name: /Layers mash/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Layers mash" })).toBeVisible();
    await page.goBack();
    await page.getByRole("link", { name: /Farm fresh eggs/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Farm fresh eggs" })).toBeVisible();

    expect(await page.evaluate(() => (window as unknown as { noReload?: boolean }).noReload)).toBe(
      true,
    );
  });

  test("an unknown product shows a helpful not-found state", async ({ page }) => {
    await page.goto("/products/no-such-product");
    await expect(page.getByRole("heading", { level: 1, name: "Product not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the shop" })).toBeVisible();
  });
});

test.describe("spike S2: hydration-safe cart", () => {
  test("the cart badge survives a reload with no hydration errors", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/products/farm-fresh-eggs");
    await waitForHydration(page);
    await expect(page.getByTestId("cart-count")).toHaveCount(0);

    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await expect(page.getByTestId("cart-link")).toHaveAccessibleName("Cart, 1 item");

    await page.reload();
    await waitForHydration(page);
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    expect(errors).toEqual([]);
  });
});

test.describe("spike S3: static SEO resources", () => {
  test("sitemap.xml lists every public URL", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.headers()["content-type"]).toContain("application/xml");
    const xml = await response.text();
    expect(xml.match(/<url>/g)).toHaveLength(41); // 12 static + 4 categories + 20 products + 5 posts
    expect(xml).toContain("<loc>http://127.0.0.1:4173/products/layers-mash</loc>");
    expect(xml).not.toContain("/admin");
  });

  test("robots.txt blocks crawling outside production", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toBe("User-agent: *\nDisallow: /\n");
  });
});
