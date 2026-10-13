// Which paths become static HTML at build time (ARCHITECTURE.md §4, §6.1).
// Imported by react-router.config.ts, so keep this file free of path aliases and browser APIs.

/** Public, indexable static pages that are pre-rendered. */
export const PRERENDERED_STATIC_PATHS: readonly string[] = [
  "/",
  "/shop",
  "/track-order",
  "/about",
  "/services",
  "/contact",
  "/faq",
  "/blog",
  "/policies/privacy",
  "/policies/terms",
  "/policies/delivery-and-returns",
  "/policies/payments",
];

/** Resource routes written out as static files. */
export const PRERENDERED_RESOURCE_PATHS: readonly string[] = ["/sitemap.xml", "/robots.txt"];

/** Path prefixes rendered only in the browser (served by __spa-fallback.html, never indexed). */
export const CLIENT_ONLY_PREFIXES: readonly string[] = [
  "/search",
  "/cart",
  "/checkout",
  "/orders",
  "/auth",
  "/account",
  "/admin",
  "/access-denied",
  "/dev",
];

export function isClientOnlyPath(path: string): boolean {
  return CLIENT_ONLY_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Combines the configured lists with dynamic paths, and fails the build if routes.ts and this file
 * disagree, so every new route has to be classified deliberately.
 */
export function resolvePrerenderPaths(staticPaths: string[], dynamicPaths: string[]): string[] {
  const known = new Set([...PRERENDERED_STATIC_PATHS, ...PRERENDERED_RESOURCE_PATHS]);

  const missing = [...known].filter((path) => !staticPaths.includes(path));
  if (missing.length > 0) {
    throw new Error(
      `Pre-render config lists paths that routes.ts does not define: ${missing.join(", ")}`,
    );
  }

  const unclassified = staticPaths.filter((path) => !known.has(path) && !isClientOnlyPath(path));
  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified static routes: ${unclassified.join(", ")}. ` +
        "Add each to PRERENDERED_STATIC_PATHS or CLIENT_ONLY_PREFIXES in src/config/prerender.ts.",
    );
  }

  return [...known, ...dynamicPaths];
}
