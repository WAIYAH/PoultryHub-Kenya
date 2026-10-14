import { expect, test } from "@playwright/test";

import { waitForHydration } from "./support";

// The link crawl (TESTING.md §5, P2-16) and J13's menu focus trap. Every same-site link on every
// public page must lead to a real page: one that renders an h1 and isn't the 404 page.

const NOT_FOUND = "We couldn't find that page";

test.describe("link crawl and layout", () => {
  test("every internal link leads to a real page", async ({ page, request, isMobile }) => {
    test.skip(isMobile, "Links don't depend on the viewport; one crawl is enough.");
    test.setTimeout(240_000);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? "").pathname,
    );

    const linked = new Map<string, string>(); // target path → first page linking to it
    for (const path of pages) {
      await page.goto(path);
      const hrefs = await page.$$eval("a[href^='/']", (links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );
      for (const href of hrefs) {
        const target = new URL(href, "https://site.invalid").pathname;
        if (!linked.has(target)) linked.set(target, path);
      }
    }

    const broken: string[] = [];
    for (const [target, source] of linked) {
      await page.goto(target);
      const heading = page.locator("main h1").first();
      const found = await heading
        .waitFor({ timeout: 10_000 })
        .then(() => heading.innerText())
        .catch(() => null);
      if (found === null || found.includes(NOT_FOUND)) {
        broken.push(`${target} (linked from ${source})`);
      }
    }
    expect(linked.size).toBeGreaterThan(40);
    expect(broken).toEqual([]);
  });

  test("J13: the mobile menu keeps focus inside until it closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "The menu button is only shown below the lg breakpoint.");
    await page.goto("/");
    await waitForHydration(page);
    await page.getByTestId("mobile-menu-button").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 20; i += 1) {
      await page.keyboard.press("Tab");
      expect(
        await dialog.evaluate((element) => element.contains(document.activeElement)),
        `focus left the menu after ${i + 1} Tab presses`,
      ).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId("mobile-menu-button")).toBeFocused();
  });
});
