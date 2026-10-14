import { expect, test, type Page } from "@playwright/test";

// SEO checks (TESTING.md §6.7, P2-15) over every URL in the sitemap, as the pre-rendered HTML
// serves them: unique titles, descriptions and canonical URLs; JPEG or PNG link previews; one h1;
// sized, described images; and JSON-LD with real fields only. Private routes are noindex.

interface PageSeo {
  path: string;
  title: string;
  description: string | null;
  canonical: string | null;
  robots: string | null;
  ogImage: string | null;
  h1Count: number;
  imagesMissingAttributes: string[];
  jsonLd: string[];
}

async function readSeo(page: Page, path: string): Promise<PageSeo> {
  await page.goto(path);
  // Products published after the build render in the browser (SPA fallback): wait for the page.
  await page
    .locator("main h1")
    .first()
    .waitFor({ timeout: 10_000 })
    .catch(() => undefined); // a missing h1 is reported by the h1-count check below
  return page.evaluate((current) => {
    const meta = (selector: string) =>
      document.querySelector(selector)?.getAttribute("content") ?? null;
    return {
      path: current,
      title: document.title,
      description: meta('meta[name="description"]'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
      robots: meta('meta[name="robots"]'),
      ogImage: meta('meta[property="og:image"]'),
      h1Count: document.querySelectorAll("h1").length,
      imagesMissingAttributes: [...document.querySelectorAll("img")]
        .filter(
          (img) =>
            !img.hasAttribute("width") || !img.hasAttribute("height") || !img.hasAttribute("alt"),
        )
        .map((img) => img.getAttribute("src") ?? "(no src)"),
      jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => script.textContent ?? "",
      ),
    };
  }, path);
}

test.describe("seo", () => {
  test("every sitemap page has unique, complete metadata", async ({
    page,
    request,
    isMobile,
    baseURL,
  }) => {
    test.skip(isMobile, "Metadata doesn't depend on the viewport; one run is enough.");
    test.setTimeout(120_000);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? "").pathname,
    );
    expect(paths.length).toBeGreaterThan(30);

    const pages: PageSeo[] = [];
    for (const path of paths) pages.push(await readSeo(page, path));

    for (const seo of pages) {
      expect.soft(seo.title, seo.path).not.toBe("");
      expect.soft(seo.description, seo.path).toBeTruthy();
      expect.soft(seo.canonical, seo.path).toBe(new URL(seo.path, baseURL).toString());
      expect.soft(seo.robots, seo.path).toBeNull();
      expect.soft(seo.ogImage, seo.path).toMatch(/\.(jpe?g|png)$/);
      expect.soft(seo.h1Count, `${seo.path} h1 count`).toBe(1);
      expect.soft(seo.imagesMissingAttributes, `${seo.path} images`).toEqual([]);
      for (const block of seo.jsonLd) {
        expect.soft(() => JSON.parse(block) as unknown, `${seo.path} JSON-LD`).not.toThrow();
        expect.soft(block, `${seo.path} JSON-LD`).not.toMatch(/aggregateRating|"review"/);
      }
    }

    const duplicates = (values: (string | null)[]) =>
      values.filter((value, index) => value !== null && values.indexOf(value) !== index);
    expect(duplicates(pages.map((seo) => seo.title)), "duplicate titles").toEqual([]);
    expect(duplicates(pages.map((seo) => seo.description)), "duplicate descriptions").toEqual([]);
    expect(duplicates(pages.map((seo) => seo.canonical)), "duplicate canonicals").toEqual([]);
  });

  for (const path of [
    "/cart",
    "/checkout",
    "/orders/PH001234",
    "/search",
    "/auth/sign-in",
    "/auth/sign-up",
    "/access-denied",
    "/no-such-page",
  ]) {
    test(`${path} is not indexed`, async ({ page, isMobile }) => {
      test.skip(isMobile, "Metadata doesn't depend on the viewport.");
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    });
  }
});
