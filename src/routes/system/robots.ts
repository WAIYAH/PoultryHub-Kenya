import { CLIENT_ONLY_PREFIXES } from "@/config/prerender";
import { getEnv } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

// Pre-rendered to build/client/robots.txt (spike S3). Non-production builds block all crawling,
// so staging and preview sites never get indexed.

export function loader() {
  const lines =
    getEnv().VITE_APP_ENV === "production"
      ? [
          "User-agent: *",
          ...CLIENT_ONLY_PREFIXES.map((prefix) => `Disallow: ${prefix}`),
          "",
          `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
        ]
      : ["User-agent: *", "Disallow: /"];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
