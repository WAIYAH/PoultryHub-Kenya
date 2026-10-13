import { expect, test, type Page } from "@playwright/test";

import {
  expectNoHorizontalScroll,
  expectNoSeriousA11yViolations,
  trackPageErrors,
  waitForHydration,
} from "./support";

// Accounts on mock auth (P2-10): journey J6 (TESTING.md §5), with the demo's on-screen email links
// standing in for Mailpit until Phase 3, plus the guard, saved addresses, profile, password
// changes, "Order again" and the signed-in checkout prefill.

const DEMO = { email: "demo@poultryhub.example", password: "demo1234" };

async function signIn(page: Page, email = DEMO.email, password = DEMO.password) {
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}

test.describe("accounts", () => {
  test("J6: sign up, confirm, sign out, sign in, order history and detail", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/auth/sign-up");
    await waitForHydration(page);
    await page.getByLabel("Full name").fill("Achieng Otieno");
    await page.getByLabel("Email", { exact: true }).fill("achieng@example.com");
    await page.getByLabel("Phone number").fill("0722 123 456");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Use at least 8 characters.")).toBeVisible();
    await page.getByLabel("Password", { exact: true }).fill("strongpass1");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Check your email" })).toBeVisible();
    await expect(page.getByText("achieng@example.com")).toBeVisible();
    await page.getByRole("link", { name: "Open the confirmation link" }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hello, Achieng" })).toBeVisible();
    await expect(page.getByText("No orders yet")).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/$/);

    // The confirmed account signs in; the account area is guarded while signed out.
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/auth\/sign-in\?next=%2Faccount%2Forders$/);
    await signIn(page, "achieng@example.com", "wrongpass1");
    await expect(page.getByRole("alert")).toContainText("don't match an account");
    await signIn(page, "achieng@example.com", "strongpass1");
    await expect(page).toHaveURL(/\/account\/orders$/);
    await expect(page.getByRole("heading", { level: 1, name: "Your orders" })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("the demo account's order history opens its orders, and orders again", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/account/orders");
    await waitForHydration(page);
    await page.getByRole("button", { name: "Use the demo account" }).click();
    await page.getByRole("button", { name: "Sign in", exact: true }).click();

    const history = page.getByTestId("order-history");
    await expect(history.getByRole("link")).toHaveCount(2);
    await expectNoHorizontalScroll(page);
    await history.getByRole("link").filter({ hasText: "Delivered" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^PH\d{6}$/);
    await expect(page.getByText("Delivered").first()).toBeVisible();

    await page.getByRole("button", { name: "Order again" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByTestId("cart-line")).toHaveCount(2);
  });

  test("checkout fills in the signed-in customer's details and default address", async ({
    page,
  }) => {
    await page.goto("/products/farm-fresh-eggs");
    await waitForHydration(page);
    await page.getByTestId("add-to-cart").click();
    await page.goto("/auth/sign-in?next=/checkout");
    await waitForHydration(page);
    await signIn(page);

    await expect(page).toHaveURL(/\/checkout$/);
    await expect(page.getByLabel("Full name")).toHaveValue("Wanjiru Demo");
    await expect(page.getByLabel("Phone number")).toHaveValue("0700 000 001");
    await expect(page.getByLabel("Estate, street or building")).toHaveValue(
      "Sample: Kamakis, Greenfield Estate, House 14",
    );
    await expect(page.getByLabel("Area", { exact: true })).toHaveValue("area-ruiru");

    await page
      .getByLabel("Use a saved address")
      .selectOption({ label: "Shop: Sample: Mwiki Road, Shop 3, Kasarani" });
    await expect(page.getByLabel("Town or neighbourhood")).toHaveValue("Kasarani");
    await expect(page.getByLabel("Area", { exact: true })).toHaveValue("area-kasarani");
  });

  test("saved addresses can be added, made default and deleted", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/account/addresses");
    await waitForHydration(page);
    await signIn(page);
    const list = page.getByTestId("address-list");
    await expect(list.getByRole("listitem")).toHaveCount(2);

    await page.getByRole("button", { name: "Add an address" }).click();
    await page.getByRole("button", { name: "Add address" }).click();
    await expect(page.getByText("Give the address a name, e.g. Home.")).toBeVisible();
    await page.getByLabel("Name for this address").fill("Farm");
    await page.getByLabel("County").selectOption("Nairobi");
    await page.getByLabel(/^Delivery area/).selectOption({ label: "Westlands" });
    await expect(page.getByLabel("Town or neighbourhood")).toHaveValue("Westlands");
    await page.getByLabel("Estate, street or building").fill("Rhapta Road, Block B");
    await page.getByRole("button", { name: "Add address" }).click();
    await expect(list.getByRole("listitem")).toHaveCount(3);

    const farm = list.getByRole("listitem").filter({ hasText: "Farm" });
    await farm.getByRole("button", { name: /Make default/ }).click();
    await expect(farm.getByText("Default", { exact: true })).toBeVisible();
    await expect(list.getByText("Default", { exact: true })).toHaveCount(1);

    await farm.getByRole("button", { name: /Delete/ }).click();
    const dialog = page.getByRole("alertdialog", { name: "Delete Farm?" });
    await dialog.getByRole("button", { name: "Delete" }).click();
    await expect(list.getByRole("listitem")).toHaveCount(2);
    await expect(list.getByText("Default", { exact: true })).toHaveCount(1); // one is still default
  });

  test("profile and password changes stick", async ({ page }) => {
    await page.goto("/auth/sign-in?next=/account/profile");
    await waitForHydration(page);
    await signIn(page);
    await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
    await page.getByLabel("Full name").fill("Wanjiru Kamau");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Profile saved")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue("Wanjiru Kamau");

    await page
      .getByRole("navigation", { name: "Account" })
      .getByRole("link", { name: "Security" })
      .click();
    await page.getByLabel("New password", { exact: true }).fill("newpass123");
    await page.getByLabel("Type it again", { exact: true }).fill("newpass124");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText("The passwords don't match.")).toBeVisible();
    await page.getByLabel("Type it again", { exact: true }).fill("newpass123");
    await page.getByRole("button", { name: "Change password" }).click();
    await expect(page.getByText("Your password has been changed")).toBeVisible();

    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.goto("/auth/sign-in");
    await waitForHydration(page);
    await signIn(page, DEMO.email, "newpass123");
    await expect(page).toHaveURL(/\/account$/);
  });

  test("a forgotten password is reset through the emailed link", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await waitForHydration(page);
    await page.getByLabel("Email", { exact: true }).fill(DEMO.email);
    await page.getByRole("button", { name: "Send the link" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Check your email" })).toBeVisible();
    const link = page.getByRole("link", { name: "Open the reset link" });
    const href = await link.getAttribute("href");
    await link.click();

    await expect(page).toHaveURL(/\/auth\/reset-password$/);
    await page.getByLabel("New password", { exact: true }).fill("resetpass9");
    await page.getByLabel("Type it again", { exact: true }).fill("resetpass9");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page).toHaveURL(/\/account$/);

    // The link works once only.
    await page.goto(href ?? "/auth/callback");
    await expect(
      page.getByRole("heading", { level: 1, name: "This link didn't work" }),
    ).toBeVisible();
    await expect(page.getByRole("alert")).toContainText("expired or was already used");
  });

  test("sign-in only returns to pages on this site", async ({ page }) => {
    await page.goto("/auth/sign-in?next=https://evil.example/");
    await waitForHydration(page);
    await signIn(page);
    await expect(page).toHaveURL(/\/account$/);
  });

  test("auth and account pages have no serious accessibility violations", async ({ page }) => {
    for (const path of ["/auth/sign-in", "/auth/sign-up", "/auth/forgot-password"]) {
      await page.goto(path);
      await waitForHydration(page);
      await expectNoSeriousA11yViolations(page);
    }
    await page.goto("/auth/sign-in");
    await waitForHydration(page);
    await signIn(page);
    await expect(page.getByRole("heading", { level: 1, name: "Hello, Wanjiru" })).toBeVisible();
    await expectNoSeriousA11yViolations(page);
  });
});
