/**
 * Where to go after signing in, from a `?next=` parameter. Only paths on this site are allowed,
 * so a crafted link can't send someone elsewhere after they sign in (an open redirect). Auth
 * pages themselves fall back to the account, to avoid loops.
 */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (!next?.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  try {
    const url = new URL(next, "https://poultryhub.invalid");
    if (url.origin !== "https://poultryhub.invalid") return fallback;
    if (url.pathname.startsWith("/auth/")) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

/** "/auth/sign-in?next=%2Faccount%2Forders" for the current page. */
export function signInPath(next: string): string {
  return `/auth/sign-in?next=${encodeURIComponent(next)}`;
}
