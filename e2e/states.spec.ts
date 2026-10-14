import { expect, test, type Page } from "@playwright/test";

import { waitForHydration } from "./support";

// J14 (TESTING.md §5): forced empty, error and slow responses show the right copy, and retry
// works once the connection is back. Scenarios are set in sessionStorage rather than ?mock=, so
// they can be switched off before retrying (src/services/mock/scenario.ts).

const SCENARIO_KEY = "phk-mock-scenario";
// Failed queries retry twice with backoff (ARCHITECTURE.md §7.2): ~4 s before the error shows.
const AFTER_RETRIES = { timeout: 10_000 };

async function setScenario(page: Page, scenario: string | null) {
  await page.evaluate(
    ([key, value]) =>
      value === null ? sessionStorage.removeItem(key) : sessionStorage.setItem(key, value),
    [SCENARIO_KEY, scenario] as const,
  );
}

async function openWith(page: Page, scenario: string, path: string) {
  await page.goto("/about");
  await setScenario(page, scenario);
  await page.goto(path);
  await waitForHydration(page);
}

test.describe("J14: loading, empty and error states", () => {
  test("shop: a failed load offers retry and WhatsApp, and retry recovers", async ({ page }) => {
    await openWith(page, "error", "/shop?q=eggs");
    await expect(page.getByRole("heading", { name: "We couldn't load products" })).toBeVisible(
      AFTER_RETRIES,
    );
    await expect(page.getByRole("link", { name: /Order on WhatsApp/ })).toBeVisible();

    await setScenario(page, null);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByTestId("product-card").first()).toBeVisible();
    await expect(page.getByTestId("result-count")).toHaveText(/^\d+ products?$/);
  });

  test("shop: no results offer to clear the filters", async ({ page }) => {
    await openWith(page, "empty", "/shop?availability=in_stock");
    await expect(
      page.getByRole("heading", { name: "No products match these filters" }),
    ).toBeVisible();
    await setScenario(page, null);
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByTestId("product-card").first()).toBeVisible();
  });

  test("search: slow responses show a loading state first", async ({ page }) => {
    await openWith(page, "slow", "/search?q=eggs");
    await expect(page.getByText("Searching…")).toBeAttached();
    await expect(page.getByRole("link", { name: "Farm fresh eggs", exact: true })).toBeVisible({
      timeout: 6_000,
    });
  });

  test("blog: a topic with no articles says so", async ({ page }) => {
    await openWith(page, "empty", "/blog?tag=eggs");
    await expect(page.getByRole("heading", { name: "No articles about eggs yet" })).toBeVisible();
    await expect(page.getByRole("link", { name: "All articles" }).last()).toBeVisible();
  });

  test("cart: prices that can't load keep the cart and retry", async ({ page }) => {
    await page.goto("/products/farm-fresh-eggs");
    await waitForHydration(page);
    await page.getByTestId("add-to-cart").click();
    await setScenario(page, "error");
    await page.goto("/cart");
    await expect(page.getByTestId("cart-line")).toHaveCount(1); // the cart itself is on the device
    await expect(page.getByRole("alert")).toContainText("No connection", AFTER_RETRIES);

    await setScenario(page, null);
    await page.getByRole("button", { name: "Try again" }).click();
    await expect(page.getByTestId("summary-subtotal")).toHaveText("KSh 550");
  });
});
