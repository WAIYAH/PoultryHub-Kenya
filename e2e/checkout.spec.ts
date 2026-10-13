import { expect, test, type Page } from "@playwright/test";

import {
  expectNoHorizontalScroll,
  expectNoSeriousA11yViolations,
  trackPageErrors,
  waitForHydration,
} from "./support";

// Checkout, order page and tracking on mock data (PLAN.md Phase 2, milestone 4): journeys J1, J4,
// J5 and J7 (TESTING.md §5) and the recovery screens (CHK-05). Sample catalogue: Farm fresh eggs,
// large tray KSh 550; delivery to Ruiru costs KSh 200.

const PHONE = "0712 345 678";

async function addToCart(page: Page, slug: string, extra = 0) {
  await page.goto(`/products/${slug}`);
  await waitForHydration(page);
  for (let i = 0; i < extra; i += 1) {
    await page.getByRole("button", { name: "Increase quantity" }).click();
  }
  await page.getByTestId("add-to-cart").click();
  await expect(page.getByTestId("cart-link")).not.toHaveAccessibleName("Cart, empty");
}

async function openCheckout(page: Page) {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();
  await expect(page.getByTestId("place-order")).toBeEnabled();
}

async function fillContact(page: Page, phone = PHONE) {
  await page.getByLabel("Full name").fill("Jane Wanjiru");
  await page.getByLabel("Phone number").fill(phone);
}

async function chooseRuiru(page: Page) {
  await page.getByLabel("County", { exact: true }).selectOption("Kiambu");
  await page.getByLabel("Area", { exact: true }).selectOption({ label: "Ruiru" });
  await page.getByLabel("Estate, street or building").fill("Greenfield Estate, House 14");
}

async function choosePickup(page: Page) {
  await page.getByRole("radio", { name: /^Pick-up/ }).check();
  await page.getByRole("radio", { name: /^Farm gate/ }).check();
}

async function placeOrder(page: Page) {
  await expect(page.getByTestId("place-order")).toBeEnabled();
  await page.getByTestId("place-order").click();
}

/** Turns a mock scenario on for the next requests (src/services/mock/scenario.ts). */
async function useScenario(page: Page, scenario: string) {
  await page.evaluate(
    (value) => window.sessionStorage.setItem("phk-mock-scenario", value),
    scenario,
  );
}

const panel = (page: Page) => page.getByTestId("mpesa-panel");

test.describe("checkout and orders", () => {
  test("J1: a guest orders for delivery and pays with M-Pesa", async ({ page }) => {
    const errors = trackPageErrors(page);
    await addToCart(page, "farm-fresh-eggs", 1);
    await page.goto("/cart");
    await page.getByTestId("cart-checkout").click();
    await expect(page.getByRole("heading", { level: 1, name: "Checkout" })).toBeVisible();

    await fillContact(page);
    await chooseRuiru(page);
    await expect(page.getByLabel("Town or neighbourhood")).toHaveValue("Ruiru");
    await expect(page.getByRole("radio", { name: /^Pay with M-Pesa/ })).toBeChecked();
    await expect(page.getByTestId("checkout-total")).toHaveText("KSh 1,300");
    await expectNoHorizontalScroll(page);
    await page.getByTestId("place-order").click();

    await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^PH\d{6}$/);
    await expect(page.getByTestId("order-next-steps")).toContainText(
      "Complete payment on your phone",
    );
    await expect(panel(page)).toHaveAttribute("data-state", "waiting");
    await expect(panel(page)).toContainText("enter your M-Pesa PIN to pay KSh 1,300");
    await expect(panel(page)).toContainText("We will never ask for your M-Pesa PIN");
    await expect(page.getByTestId("payment-window")).toContainText(
      /holding your items for \d+:\d\d/,
    );
    await expect(page.getByTestId("cart-link")).toHaveAccessibleName("Cart, empty");
    await expectNoHorizontalScroll(page);

    await page.getByRole("button", { name: "Simulate success" }).click();
    await expect(panel(page)).toHaveAttribute("data-state", "paid");
    await expect(panel(page)).toContainText(/M-Pesa receipt MOCK/);
    await expect(page.getByText("Payment confirmed").first()).toBeVisible();
    await expect(page.getByTestId("order-timeline")).toContainText("Payment received: KSh 1,300");
    expect(errors).toEqual([]);
  });

  test("J7: guest tracking by link, and by number and phone", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await fillContact(page);
    await choosePickup(page);
    await page.getByRole("radio", { name: /^Pay at pick-up/ }).check();
    await placeOrder(page);
    await expect(page.getByTestId("order-next-steps")).toContainText("Pay by M-Pesa or cash");
    const orderNumber = (await page.getByRole("heading", { level: 1 }).innerText()).trim();
    const secretLink = page.url();

    // Without the token, the order isn't shown (BR-28).
    await page.goto(`/orders/${orderNumber}`);
    await expect(
      page.getByRole("heading", { level: 1, name: "We couldn't find this order" }),
    ).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Track an order" }).click();
    await expect(page).toHaveURL(new RegExp(`/track-order\\?order=${orderNumber}$`));
    await waitForHydration(page);
    await expect(page.getByLabel("Order number")).toHaveValue(orderNumber);

    await page.getByLabel("Phone number used for the order").fill("0700 000 000");
    await page.getByRole("button", { name: "Find my order" }).click();
    await expect(page.getByTestId("track-not-found")).toBeVisible();

    await page.getByLabel("Phone number used for the order").fill("+254712345678");
    await page.getByRole("button", { name: "Find my order" }).click();
    const result = page.getByTestId("track-result");
    await expect(result).toContainText(orderNumber);
    await expect(result).toContainText("Order received: we'll confirm shortly");
    await expect(result).not.toContainText("Jane"); // status only, never personal data
    await expect(result).not.toContainText("Farm gate");

    await page.goto(secretLink);
    await expect(page.getByRole("heading", { level: 1, name: orderNumber })).toBeVisible();
    await expect(page.getByText("Jane Wanjiru")).toBeVisible();
  });

  test("J5: M-Pesa failures, retry and the Paybill fallback", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await fillContact(page);
    await choosePickup(page);
    await placeOrder(page);
    await expect(panel(page)).toHaveAttribute("data-state", "waiting");

    await page.getByRole("button", { name: "Simulate cancel" }).click();
    await expect(panel(page)).toHaveAttribute("data-state", "failed");
    await expect(panel(page)).toContainText("You cancelled the M-Pesa prompt");
    await page.getByLabel("M-Pesa phone number").fill("0712 999");
    await page.getByTestId("send-mpesa-prompt").click();
    await expect(panel(page)).toContainText("Enter a Kenyan mobile number");

    await page.getByLabel("M-Pesa phone number").fill("0722 000 111");
    await page.getByTestId("send-mpesa-prompt").click();
    await expect(panel(page)).toHaveAttribute("data-state", "waiting");
    await expect(page.getByTestId("order-timeline")).toContainText(
      "M-Pesa prompt sent to 0722 000 111",
    );

    await page.getByRole("button", { name: "Simulate timeout" }).click();
    await expect(panel(page)).toHaveAttribute("data-state", "failed");
    await expect(panel(page)).toContainText("We couldn't reach your phone");

    await page.getByRole("button", { name: "Pay via Paybill instead" }).click();
    await expect(page.getByTestId("paybill-instructions")).toContainText("For the account number");

    await page.getByTestId("send-mpesa-prompt").click();
    await expect(panel(page)).toHaveAttribute("data-state", "waiting");
    await page.getByRole("button", { name: "Simulate success" }).click();
    await expect(panel(page)).toHaveAttribute("data-state", "paid");
  });

  test("J4: a price change before placing shows a review screen", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs", 1);
    await openCheckout(page);
    await fillContact(page);
    await chooseRuiru(page);
    await page.getByRole("radio", { name: /^Pay on delivery/ }).check();
    await expect(page.getByTestId("checkout-total")).toHaveText("KSh 1,300");

    await useScenario(page, "price-changed"); // every price rises by KSh 20
    await placeOrder(page);
    const recovery = page.getByTestId("checkout-recovery");
    await expect(recovery.getByRole("heading", { name: "Some prices changed" })).toBeFocused();
    await expect(recovery).toContainText("KSh 550");
    await expect(recovery).toContainText("KSh 570 / tray");
    await expect(recovery).toContainText("New total: KSh 1,340 (was KSh 1,300)");
    await page.getByTestId("place-at-new-total").click();

    await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
    await expect(page.getByTestId("order-total")).toHaveText("KSh 1,340");
  });

  test("not enough stock: the recovery screen updates the order", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs", 2);
    await openCheckout(page);
    await fillContact(page);
    await choosePickup(page);
    await useScenario(page, "low-stock"); // only the minimum quantity is left
    await placeOrder(page);

    const recovery = page.getByTestId("checkout-recovery");
    await expect(recovery.getByRole("heading", { name: "Some items have changed" })).toBeVisible();
    await expect(recovery).toContainText("Change 3 trays to 1 tray");
    await page.getByTestId("apply-stock-fixes").click();
    await expect(page.getByTestId("checkout-total")).toHaveText("KSh 550");
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Wanjiru"); // nothing re-typed
    await placeOrder(page);
    await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
  });

  test("an area that stopped being served offers pick-up instead", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await fillContact(page);
    await chooseRuiru(page);
    await page.getByRole("radio", { name: /^Pay on delivery/ }).check();
    await useScenario(page, "area-closed");
    await placeOrder(page);

    const recovery = page.getByTestId("checkout-recovery");
    await expect(recovery.getByRole("heading")).toHaveText("We don't deliver to Ruiru any more");
    await recovery.getByRole("button", { name: "Choose pick-up instead" }).click();
    await expect(page.getByRole("radio", { name: /^Pick-up/ })).toBeChecked();
    // Pay on delivery doesn't apply to pick-up any more, so it was replaced (CHK-04).
    await expect(page.getByRole("radio", { name: /^Pay on delivery/ })).toHaveCount(0);
    await page.getByRole("radio", { name: /^Farm gate/ }).check();
    await placeOrder(page);
    await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
  });

  test("a phone with three unpaid orders can't place a fourth (BR-29)", async ({ page }) => {
    for (let i = 0; i < 4; i += 1) {
      await addToCart(page, "farm-fresh-eggs");
      await openCheckout(page);
      await fillContact(page);
      await choosePickup(page);
      await page.getByRole("radio", { name: /^Pay at pick-up/ }).check();
      await placeOrder(page);
      if (i < 3) await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
    }
    const recovery = page.getByTestId("checkout-recovery");
    await expect(recovery.getByRole("heading")).toHaveText("You have unpaid orders waiting");
    await expect(recovery.getByRole("link", { name: "Track an order" })).toBeVisible();
  });

  test("errors are summarised, linked to their fields, and the draft survives a reload", async ({
    page,
  }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await page.getByTestId("place-order").click();

    const summary = page.getByTestId("checkout-error-summary");
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("Please fix 6 fields");
    await summary.getByRole("link", { name: "Phone number" }).click();
    await expect(page.getByLabel("Phone number")).toBeFocused();
    await expect(page.getByLabel("Phone number")).toHaveAttribute("aria-invalid", "true");

    await fillContact(page);
    await expect(summary).toContainText("Please fix 4 fields"); // shrinks as fields are fixed
    await page.getByLabel("Email").fill("jane@example.com");

    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("Jane Wanjiru");
    await expect(page.getByLabel("Email")).toHaveValue("jane@example.com");
    await expectNoSeriousA11yViolations(page);
  });

  test("a pending order can be cancelled after confirming", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await fillContact(page);
    await choosePickup(page);
    await page.getByRole("radio", { name: /^Pay at pick-up/ }).check();
    await placeOrder(page);
    await expect(page).toHaveURL(/\/orders\/PH\d{6}\?token=/);
    const orderNumber = (await page.getByRole("heading", { level: 1 }).innerText()).trim();

    await page.getByRole("button", { name: "Cancel order" }).click();
    const dialog = page.getByRole("alertdialog", { name: `Cancel order ${orderNumber}?` });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel order" }).click();
    await expect(page.getByText("This order was cancelled.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel order" })).toHaveCount(0);
  });

  test("the order page has no serious accessibility violations", async ({ page }) => {
    await addToCart(page, "farm-fresh-eggs");
    await openCheckout(page);
    await fillContact(page);
    await choosePickup(page);
    await placeOrder(page);
    await expect(panel(page)).toHaveAttribute("data-state", "waiting");
    await expectNoSeriousA11yViolations(page);
  });
});
