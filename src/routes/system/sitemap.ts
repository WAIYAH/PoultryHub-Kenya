import { PRERENDERED_STATIC_PATHS } from "@/config/prerender";
import { absoluteUrl } from "@/lib/seo";
import { getServices } from "@/services";

// Pre-rendered to build/client/sitemap.xml (spike S3). Lists every public, indexable URL, with
// `lastmod` where the content has a date (ARCHITECTURE.md §11).

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

interface Entry {
  path: string;
  lastmod?: string;
}

export async function loader() {
  const { catalog, content } = getServices();
  const [categories, products, posts] = await Promise.all([
    catalog.listCategories(),
    catalog.listProducts({ pageSize: 10_000 }),
    content.listPosts({ pageSize: 10_000 }),
  ]);

  const entries: Entry[] = [
    ...PRERENDERED_STATIC_PATHS.map((path) => ({ path })),
    ...categories.map((category) => ({ path: `/shop/${category.slug}` })),
    ...products.items.map((product) => ({
      path: `/products/${product.slug}`,
      lastmod: product.publishedAt.slice(0, 10),
    })),
    ...posts.items.map((post) => ({
      path: `/blog/${post.slug}`,
      lastmod: post.publishedAt.slice(0, 10),
    })),
  ];
  const urls = entries
    .map(
      ({ path, lastmod }) =>
        `  <url><loc>${escapeXml(absoluteUrl(path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
    )
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
