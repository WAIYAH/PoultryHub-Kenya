import { SearchView } from "@/features/content/components/search-view";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/search";

// Site search (SITE-11): rendered in the browser; never indexed.

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Search",
    description: "Search products, articles and FAQs.",
    path: "/search",
    noindex: true,
  });

export default function SearchRoute() {
  return <SearchView />;
}
