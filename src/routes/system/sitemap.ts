import { PRERENDERED_STATIC_PATHS } from "@/config/prerender";
import { absoluteUrl } from "@/lib/seo";
import { getServices } from "@/services";

// Pre-rendered to build/client/sitemap.xml (spike S3). Lists every public, indexable URL.

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => `&#${char.charCodeAt(0)};`);
}

export async function loader() {
  const { catalog } = getServices();
  const [categories, products] = await Promise.all([
    catalog.listCategories(),
    catalog.listProducts({ pageSize: 10_000 }),
  ]);

  const paths = [
    ...PRERENDERED_STATIC_PATHS,
    ...categories.map((category) => `/shop/${category.slug}`),
    ...products.items.map((product) => `/products/${product.slug}`),
  ];
  const urls = paths
    .map((path) => `  <url><loc>${escapeXml(absoluteUrl(path))}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
