import type { ShouldRevalidateFunctionArgs } from "react-router";

/**
 * For loaders whose data ignores the query string, like the shop and category pages: their
 * filters live in the URL and load through the page's own query (CAT-02), so a filter change
 * shouldn't wait for the loader to run again before the page responds.
 */
export function revalidateOnPathChange({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs): boolean {
  if (formMethod === undefined && currentUrl.pathname === nextUrl.pathname) return false;
  return defaultShouldRevalidate;
}
