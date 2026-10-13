import type { MetaDescriptor } from "react-router";

import { site } from "@/config/site";
import type { SiteSettings } from "@/types/domain";

import { getEnv } from "./env";

// SEO helpers (ARCHITECTURE.md §11). Structured data only ever contains real, supplied fields
// (NFR-SEO-1): no invented ratings, addresses or coordinates.

export interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** Link-preview image; defaults to the site image. Use a JPEG for WhatsApp previews. */
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
  const image = input.image === undefined ? site.ogImage : input.image;
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
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
  ];

  if (image) {
    tags.push(
      { property: "og:image", content: absoluteUrl(image.url) },
      { property: "og:image:alt", content: image.alt },
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

/** Organization structured data from the fields the business has actually supplied. */
export function organizationJsonLd(settings: SiteSettings): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.businessName,
    url: absoluteUrl("/"),
    description: site.description,
    logo: absoluteUrl("/favicon.svg"),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.socialLinks.length > 0
      ? { sameAs: settings.socialLinks.map((link) => link.url) }
      : {}),
  };
}

export interface Crumb {
  label: string;
  href?: string;
}

/** BreadcrumbList for pages with breadcrumbs (ARCHITECTURE.md §11). */
export function breadcrumbJsonLd(crumbs: Crumb[], currentPath: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.href ?? currentPath),
    })),
  };
}
