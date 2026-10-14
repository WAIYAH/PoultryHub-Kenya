import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Search, SearchX } from "lucide-react";
import { type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { FaqList } from "@/components/shared/faq-list";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductGrid } from "@/features/catalog";
import { cn } from "@/lib/utils";

import { contentQueries } from "../queries";

import { BlogCard } from "./blog-card";

const SUGGESTIONS = ["mayai", "chicks", "kienyeji", "layers mash", "feeder"];

/**
 * Site search (SITE-11): products (with Swahili names, CAT-12), articles and FAQs. The query lives
 * in the URL, so results can be shared and the Back button works.
 */
export function SearchView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const results = useQuery({
    ...contentQueries.search(query),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  });
  const data = query ? results.data : undefined;
  const count = data ? data.products.length + data.posts.length + data.faqs.length : 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q");
    const next = typeof q === "string" ? q.trim() : "";
    setSearchParams(next ? { q: next } : {});
  }

  return (
    <>
      <div className="border-b border-line bg-forest-50 py-10 sm:py-14">
        <Container className="flex flex-col gap-5">
          <h1 className="text-h1 text-ink-900">{query ? `Results for “${query}”` : "Search"}</h1>
          <form role="search" onSubmit={submit} className="flex max-w-xl gap-2">
            <label htmlFor="site-search" className="sr-only">
              Search products, articles and FAQs
            </label>
            <input
              key={query}
              id="site-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="e.g. mayai, chicks, layers mash"
              enterKeyHint="search"
              className="h-12 min-w-0 flex-1 rounded-full border border-input bg-white px-5 text-base text-ink-900 placeholder:text-ink-500 focus-visible:border-ring"
            />
            <Button type="submit" size="lg">
              <Search aria-hidden="true" /> Search
            </Button>
          </form>
          {query && data ? (
            <p className="text-sm text-ink-700" aria-live="polite" data-testid="search-count">
              {count === 0 ? "No results" : `${count} ${count === 1 ? "result" : "results"}`}
            </p>
          ) : null}
        </Container>
      </div>

      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        {!query ? (
          <div className="flex flex-col gap-3">
            <p className="text-ink-700">Try one of these:</p>
            <ul className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <li key={suggestion}>
                  <Link
                    to={`/search?q=${encodeURIComponent(suggestion)}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-forest-200 bg-white px-4 text-sm font-semibold text-forest-900 hover:bg-forest-100"
                  >
                    {suggestion}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.isError && !data ? (
          <ErrorState
            title="Search isn't working right now"
            description="Check your connection and try again."
            onRetry={() => void results.refetch()}
            retrying={results.isFetching}
          />
        ) : !data ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-[3/4] w-full rounded-lg" />
            ))}
            <span className="sr-only">Searching…</span>
          </div>
        ) : count === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`Nothing matches “${query}”`}
            description="Try another word, or browse the shop."
            actions={
              <Link to="/shop" className={buttonVariants()}>
                Browse all products
              </Link>
            }
          />
        ) : (
          <div
            className={cn("flex flex-col gap-12", results.isPlaceholderData && "opacity-60")}
            aria-busy={results.isPlaceholderData}
          >
            {data.products.length > 0 ? (
              <section aria-labelledby="results-products" className="flex flex-col gap-5">
                <h2 id="results-products" className="text-h2 text-ink-900">
                  Products <span className="text-ink-600">({data.products.length})</span>
                </h2>
                <ProductGrid products={data.products} headingLevel={3} />
              </section>
            ) : null}
            {data.posts.length > 0 ? (
              <section aria-labelledby="results-posts" className="flex flex-col gap-5">
                <h2 id="results-posts" className="text-h2 text-ink-900">
                  Articles <span className="text-ink-600">({data.posts.length})</span>
                </h2>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {data.posts.map((post) => (
                    <li key={post.slug}>
                      <BlogCard post={post} headingLevel={3} />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            {data.faqs.length > 0 ? (
              <section aria-labelledby="results-faqs" className="flex max-w-3xl flex-col gap-5">
                <h2 id="results-faqs" className="text-h2 text-ink-900">
                  Questions <span className="text-ink-600">({data.faqs.length})</span>
                </h2>
                <FaqList faqs={data.faqs} />
              </section>
            ) : null}
          </div>
        )}
      </Container>
    </>
  );
}
