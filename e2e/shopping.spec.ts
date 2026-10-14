import { expect, test, type Locator, type Page } from "@playwright/test";

import {
  expectNoHorizontalScroll,
  expectNoSeriousA11yViolations,
  trackPageErrors,
  waitForHydration,
} from "./support";

// Browse → filter → product → cart: the first half of journey J1 (TESTING.md §5); checkout and
// payment follow with P2-08. Runs on the sample catalogue: Farm fresh eggs, large tray, KSh 550.

/**
 * Runs `act` on the filter panel: the sidebar on desktop, the filter sheet on mobile. A category
 * link closes the sheet itself; otherwise "Show N products" closes it.
 */
async function withFilters(
  page: Page,
  isMobile: boolean,
  act: (panel: Locator) => Promise<void>,
  { closesSheet = false } = {},
) {
  if (!isMobile) {
    await act(page.getByRole("complementary", { name: "Filters" }));
    return;
  }
  await page.getByRole("button", { name: /^Filters/ }).click();
  const sheet = page.getByRole("dialog", { name: "Filters" });
  await expect(sheet).toBeVisible();
  await act(sheet);
  if (!closesSheet) await sheet.getByRole("button", { name: /^Show \d+ products?$/ }).click();
  await expect(sheet).toBeHidden();
}

test.describe("shopping", () => {
  test("browse, filter, choose a product and check the cart", async ({ page, isMobile }) => {
    const errors = trackPageErrors(page);
    await page.goto("/shop");
    await waitForHydration(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByTestId("result-count")).toHaveText(/^\d+ products$/);

    // Category, then availability: both live in the URL so the view can be shared.
    await withFilters(
      page,
      isMobile,
      (panel) => panel.getByRole("link", { name: /^Eggs/ }).click(),
      { closesSheet: true },
    );
    await expect(page).toHaveURL(/\/shop\/eggs$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/eggs/i);

    // The box reflects the URL, which updates a few milliseconds after the tap, so click it and
    // wait for the result rather than `check()`, which expects an instant change.
    await withFilters(page, isMobile, async (panel) => {
      const inStock = panel.getByRole("checkbox", { name: "In stock" });
      await inStock.click();
      await expect(inStock).toBeChecked();
    });
    await expect(page).toHaveURL(/\/shop\/eggs\?availability=in_stock$/);
    await expect(page.getByRole("button", { name: "In stock (remove filter)" })).toBeVisible();
    await expect(page.getByTestId("result-count")).toHaveText(/^\d+ products?$/);
    await expectNoHorizontalScroll(page);

    await page.getByRole("link", { name: "Farm fresh eggs", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Farm fresh eggs" })).toBeVisible();
    await expect(page).toHaveURL(/\/products\/farm-fresh-eggs$/);

    // Two large trays.
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByText("Total: KSh 1,100")).toBeVisible();
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-link")).toHaveAccessibleName("Cart, 1 item");
    await expect(page.getByText("Added 2 trays of Farm fresh eggs to your cart")).toBeVisible();

    // Once hydrated, the header cart opens the drawer; "View cart" goes to the full page.
    await page.getByTestId("cart-link").click();
    const drawer = page.getByTestId("cart-drawer");
    await expect(drawer).toBeVisible();
    await drawer.getByRole("link", { name: "View cart" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Your cart" })).toBeVisible();

    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await expect(page.getByTestId("summary-subtotal")).toHaveText("KSh 1,100");

    await page.getByLabel("Promo code").fill("karibu10");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page.getByTestId("summary-discount")).toHaveText("−KSh 110");

    await page.getByLabel("County", { exact: true }).selectOption("Kiambu");
    await page.getByLabel("Area", { exact: true }).selectOption({ label: "Ruiru" });
    await expect(page.getByTestId("summary-delivery")).toHaveText("KSh 200");
    await expect(page.getByTestId("summary-total")).toHaveText("KSh 1,190");
    await expect(page.getByTestId("cart-checkout")).toBeVisible();
    await expectNoHorizontalScroll(page);
    await expectNoSeriousA11yViolations(page);

    // The cart, promo code and delivery area are saved on the device.
    await page.reload();
    await waitForHydration(page);
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await expect(page.getByTestId("summary-discount")).toHaveText("−KSh 110");
    await expect(page.getByTestId("summary-total")).toHaveText("KSh 1,190");

    expect(errors).toEqual([]);
  });

  test("a search with no matches offers a way back", async ({ page }) => {
    await page.goto("/shop");
    await waitForHydration(page);
    await page.getByRole("searchbox", { name: "Search products" }).fill("zzzz");
    await page.getByRole("button", { name: "Search", exact: true }).click();

    await expect(page).toHaveURL(/\/shop\?q=zzzz$/);
    await expect(page.getByRole("heading", { name: "No products match “zzzz”" })).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByTestId("result-count")).toHaveText(/^\d+ products$/);
  });

  test("every card's button fits inside its card", async ({ page }) => {
    // Two columns on a 360px phone leave each button about 126px (P2-17 found the quote button
    // spilling out). Screen-reader text is excluded: it is clipped to 1px by design.
    await page.goto("/shop");
    await waitForHydration(page);
    const overflowing = await page.$$eval("[data-testid=product-card] .mt-auto > *", (buttons) =>
      buttons
        .filter((button) => button.scrollWidth > button.clientWidth)
        .map((button) => button.textContent?.trim() ?? ""),
    );
    expect(overflowing).toEqual([]);
  });

  test("the shop listing has no serious accessibility violations", async ({ page }) => {
    await page.goto("/shop/eggs");
    await waitForHydration(page);
    await expectNoSeriousA11yViolations(page);
  });
});
