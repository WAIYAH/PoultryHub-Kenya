import type { MetaDescriptor } from "react-router";

import { site } from "@/config/site";

import { getEnv } from "./env";

// SEO helpers (ARCHITECTURE.md §11). Structured data only ever contains real, supplied fields.

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: { url: string; alt: string } | null;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

export function absoluteUrl(path: string): string {
  return new URL(path, getEnv().VITE_SITE_URL).toString();
}

export function fullTitle(title: string): string {
  return title === site.name ? site.name : `${title} | ${site.name}`;
}

export function pageMeta(input: PageMetaInput): MetaDescriptor[] {
  const url = absoluteUrl(input.path);
  const title = fullTitle(input.title);
  const tags: MetaDescriptor[] = [
    { title },
    { name: "description", content: input.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: site.name },
    { property: "og:locale", content: "en_KE" },
    { property: "og:type", content: input.type ?? "website" },
    { property: "og:title", content: title },
    { property: "og:description", content: input.description },
    { property: "og:url", content: url },
    { name: "twitter:card", content: input.image ? "summary_large_image" : "summary" },
  ];

  if (input.image) {
    tags.push(
      { property: "og:image", content: absoluteUrl(input.image.url) },
      { property: "og:image:alt", content: input.image.alt },
    );
  }
  if (input.noindex) {
    tags.push({ name: "robots", content: "noindex, nofollow" });
  }
  for (const data of [input.jsonLd ?? []].flat()) {
    tags.push({ "script:ld+json": data });
  }
  return tags;
}
