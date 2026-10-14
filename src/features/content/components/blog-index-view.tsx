import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Newspaper } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { PageLinks } from "@/components/shared/page-links";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";
import type { BlogPostSummary, Page } from "@/types/domain";

import { contentQueries } from "../queries";

import { BlogCard } from "./blog-card";

function blogHref(tag: string | null, page = 1): string {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/blog?${search}` : "/blog";
}

/**
 * Blog index (CNT-03): newest first, with tag filters and numbered pages in the URL. The first
 * unfiltered page is pre-rendered; other views load in the browser once hydrated.
 */
export function BlogIndexView({
  initialPage,
  tags,
  loadedAt,
}: {
  initialPage: Page<BlogPostSummary>;
  tags: string[];
  loadedAt: number;
}) {
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();
  const requestedTag = hydrated ? searchParams.get("tag") : null;
  const tag = requestedTag && tags.includes(requestedTag) ? requestedTag : null;
  const requestedPage = hydrated ? Number(searchParams.get("page")) : 1;
  const page = Number.isInteger(requestedPage) && requestedPage > 1 ? requestedPage : 1;
  const isDefault = tag === null && page === 1;

  const posts = useQuery({
    ...contentQueries.posts(tag, page),
    ...(isDefault ? { initialData: initialPage, initialDataUpdatedAt: loadedAt } : {}),
    placeholderData: keepPreviousData,
  });
  const data = posts.data;
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        title="Blog"
        description="Practical guides on raising chicks, keeping layers and buying for your home or business."
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      >
        {tags.length > 0 ? (
          <nav aria-label="Topics">
            <ul className="flex flex-wrap gap-2">
              {[null, ...tags].map((item) => {
                const active = item === tag;
                return (
                  <li key={item ?? "all"}>
                    <Link
                      to={blogHref(item)}
                      aria-current={active ? "page" : undefined}
                      preventScrollReset
                      className={cn(
                        "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold capitalize",
                        active
                          ? "border-forest-900 bg-forest-900 text-white"
                          : "border-forest-200 bg-white text-forest-900 hover:bg-forest-100",
                      )}
                    >
                      {item ?? "All articles"}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </PageHeader>

      <Container className="flex flex-col gap-8 py-10 sm:py-14">
        {posts.isError && !data ? (
          <ErrorState
            title="We couldn't load the articles"
            description="Check your connection and try again."
            onRetry={() => void posts.refetch()}
            retrying={posts.isFetching}
          />
        ) : !data ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="aspect-[4/5] w-full rounded-lg" />
            ))}
            <span className="sr-only">Loading articles…</span>
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={tag ? `No articles about ${tag} yet` : "No articles yet"}
            description="New guides are added regularly."
            actions={
              tag ? (
                <Link to="/blog" className={buttonVariants()}>
                  All articles
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ul
            className={cn(
              "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
              posts.isPlaceholderData && "opacity-60 transition-opacity",
            )}
            aria-busy={posts.isPlaceholderData}
          >
            {data.items.map((post, index) => (
              <li key={post.slug}>
                <BlogCard post={post} priority={index < 2} />
              </li>
            ))}
          </ul>
        )}
        <PageLinks
          page={page}
          pageCount={pageCount}
          hrefFor={(p) => blogHref(tag, p)}
          label="Article pages"
        />
      </Container>
    </>
  );
}
