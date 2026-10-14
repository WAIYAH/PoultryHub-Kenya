import { expect, test } from "@playwright/test";

import {
  expectNoHorizontalScroll,
  expectNoSeriousA11yViolations,
  trackPageErrors,
  waitForHydration,
} from "./support";

// Content pages (P2-11): About, Services, Contact, FAQ, Blog, Search and Policies.

test.describe("content pages", () => {
  test("about and services show their content blocks", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/about");
    await expect(
      page.getByRole("heading", { level: 1, name: "About PoultryHub Kenya" }),
    ).toBeVisible();
    for (const name of [
      "Our story",
      "Our mission",
      "Our vision",
      "How we farm",
      "Our commitments",
    ]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
    await page.goto("/services");
    await expect(page.getByRole("heading", { level: 1, name: "Our services" })).toBeVisible();
    await expect(page.getByTestId("services").getByRole("listitem").first()).toBeVisible();
    await expect(
      page
        .getByRole("region", { name: "Need a regular or bulk supply?" })
        .getByRole("link", { name: "Request a quote" }),
    ).toHaveAttribute("href", "/contact?subject=wholesale_quote");
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  test("the FAQ groups questions by topic and answers open in place", async ({ page }) => {
    await page.goto("/faq");
    await waitForHydration(page);
    const topics = page.getByRole("navigation", { name: "FAQ topics" });
    await topics.getByRole("link", { name: "Payments" }).click();
    await expect(page).toHaveURL(/#faq-payments$/);
    const first = page.locator("#faq-payments").getByTestId("faq-item").first();
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
  });

  test("the contact form checks its fields and sends a message", async ({ page }) => {
    await page.goto("/contact");
    await waitForHydration(page);
    await page.getByTestId("contact-submit").click();
    await expect(page.getByLabel("Your name")).toBeFocused();
    await expect(page.getByText("Give a phone number or an email so we can reply.")).toBeVisible();
    await expect(page.getByText("Write at least 10 characters.")).toBeVisible();

    await page.getByLabel("Your name").fill("Jane Wanjiru");
    await page.getByLabel(/^Phone number/).fill("0712 345 678");
    await expect(page.getByText("Give a phone number or an email so we can reply.")).toBeHidden();
    await page.getByLabel("What's it about?").selectOption("order_help");
    await page.getByLabel(/^Order number/).fill("ph001234");
    await page
      .getByLabel("Message", { exact: true })
      .fill("My order hasn't arrived yet. Can you check?");
    await page.getByTestId("contact-submit").click();

    await expect(page.getByTestId("contact-sent")).toContainText("Thanks, Jane");
    await page.getByRole("button", { name: "Send another message" }).click();
    await expect(page.getByLabel("Your name")).toHaveValue("");
  });

  test("a quote request from a product page arrives filled in", async ({ page }) => {
    await page.goto("/products/regular-egg-supply");
    await waitForHydration(page);
    await page.getByRole("link", { name: "Request a quote" }).click();
    await expect(page).toHaveURL(/\/contact\?subject=wholesale_quote&product=regular-egg-supply$/);
    await expect(page.getByLabel("What's it about?")).toHaveValue("wholesale_quote");
    await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
      "I'd like a quote for regular egg supply.",
    );
  });

  test("the blog filters by topic and opens articles", async ({ page }) => {
    const errors = trackPageErrors(page);
    await page.goto("/blog");
    await waitForHydration(page);
    await expect(page.getByTestId("blog-card")).toHaveCount(5);

    const topics = page.getByRole("navigation", { name: "Topics" });
    await topics.getByRole("link", { name: "eggs", exact: true }).click();
    await expect(page).toHaveURL(/\/blog\?tag=eggs$/);
    await expect(topics.getByRole("link", { name: "eggs", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByTestId("blog-card")).toHaveCount(1);

    await page.getByRole("link", { name: "How to store eggs at home" }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "How to store eggs at home" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Keep them cool" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Share on WhatsApp/ })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/\?text=How%20to%20store%20eggs%20at%20home/,
    );
    await expect(page.getByRole("heading", { name: "More articles" })).toBeVisible();
    await expectNoHorizontalScroll(page);
    expect(errors).toEqual([]);
  });

  test("article links inside the text work like any other link", async ({ page }) => {
    await page.goto("/blog/brooder-checklist-day-old-chicks");
    await waitForHydration(page);
    await page.getByRole("link", { name: "See our day-old chicks" }).click();
    await expect(page).toHaveURL(/\/shop\/day-old-chicks$/);
  });

  test("an unknown article shows a helpful not-found page", async ({ page }) => {
    await page.goto("/blog/no-such-article");
    await expect(page.getByRole("heading", { level: 1, name: "Article not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the blog" })).toBeVisible();
  });

  test("policy pages say they're templates and link to each other", async ({ page }) => {
    await page.goto("/policies/privacy");
    await waitForHydration(page);
    await expect(page.getByRole("heading", { level: 1, name: "Privacy policy" })).toBeVisible();
    await expect(page.getByTestId("policy-review")).toHaveText(
      "Template: not yet reviewed by an advocate",
    );
    await expect(page.getByText("Draft for legal review.")).toBeVisible();
    await page
      .getByRole("navigation", { name: "Other policies" })
      .getByRole("link", { name: "Terms" })
      .click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Terms and conditions" }),
    ).toBeVisible();
  });

  test("search finds products by their Swahili names, and says when nothing matches", async ({
    page,
  }) => {
    await page.goto("/search");
    await waitForHydration(page);
    await page.getByRole("link", { name: "mayai" }).click();
    await expect(page).toHaveURL(/\/search\?q=mayai$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "Results for “mayai”" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Farm fresh eggs", exact: true })).toBeVisible();

    await page.getByRole("searchbox", { name: "Search products, articles and FAQs" }).fill("zzzz");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Nothing matches “zzzz”" })).toBeVisible();
    await page.goBack();
    await expect(
      page.getByRole("heading", { level: 1, name: "Results for “mayai”" }),
    ).toBeVisible();
  });

  for (const path of [
    "/about",
    "/services",
    "/contact",
    "/faq",
    "/blog",
    "/blog/feeding-layers",
    "/policies/delivery-and-returns",
    "/search?q=chicks",
  ]) {
    test(`no serious accessibility violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await waitForHydration(page);
      await expectNoSeriousA11yViolations(page);
    });
  }
});
