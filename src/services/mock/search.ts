import { faqs } from "@/mocks/fixtures/content";

import type { SearchService } from "../contracts";

import { matchesProductQuery, storefrontProducts, toSummary } from "./catalog";
import { publishedPosts, toPostSummary } from "./content";
import { mockRequest } from "./latency";

function matchesText(texts: string[], query: string): boolean {
  const haystack = texts.join(" ").toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** Site search across products, blog posts and FAQs (SITE-11), with Swahili synonyms (CAT-12). */
export function createMockSearchService(): SearchService {
  return {
    async search(rawQuery) {
      const scenarios = await mockRequest();
      const query = rawQuery.trim();
      if (!query || scenarios.has("empty")) return { query, products: [], posts: [], faqs: [] };

      return {
        query,
        products: storefrontProducts(scenarios)
          .filter((product) => matchesProductQuery(product, query))
          .map(toSummary),
        posts: publishedPosts()
          .filter((post) => matchesText([post.title, post.excerpt, ...post.tags], query))
          .map(toPostSummary),
        faqs: faqs.filter((faq) => matchesText([faq.question, faq.answer], query)),
      };
    },
  };
}
