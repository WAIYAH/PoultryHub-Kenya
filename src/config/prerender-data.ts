// Dynamic paths to pre-render: categories, products and blog posts.
// Phases 1–2: SAMPLE fixtures. Phase 3 replaces this with a Supabase query using the publishable
// key (public data only). This is the only module outside services/mock that reads fixtures,
// because react-router.config.ts runs in Node before the app's service layer exists.
import { blogPosts } from "../mocks/fixtures/blog";
import { categories, products } from "../mocks/fixtures/catalog";

export function loadDynamicPrerenderPaths(): Promise<string[]> {
  const now = Date.now();
  return Promise.resolve([
    ...categories.map((category) => `/shop/${category.slug}`),
    // Products marked as published after the build are deliberately left out: they exercise the
    // SPA-fallback path for new products (ARCHITECTURE.md §14.2, spike S1).
    ...products
      .filter((product) => !product.fixture?.publishedAfterBuild)
      .map((product) => `/products/${product.slug}`),
    ...blogPosts
      .filter((post) => Date.parse(post.publishedAt) <= now)
      .map((post) => `/blog/${post.slug}`),
  ]);
}
