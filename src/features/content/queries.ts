import { queryOptions } from "@tanstack/react-query";

import { getServices } from "@/services";

// Content changes rarely: 5-minute stale time (ARCHITECTURE.md §7.2).
const STALE = 5 * 60_000;

export const BLOG_PAGE_SIZE = 9;

export const contentKeys = {
  posts: (tag: string | null, page: number) => ["content", "posts", tag, page] as const,
  search: (query: string) => ["search", query] as const,
};

export const contentQueries = {
  posts: (tag: string | null, page: number) =>
    queryOptions({
      queryKey: contentKeys.posts(tag, page),
      queryFn: () =>
        getServices().content.listPosts({ tag: tag ?? undefined, page, pageSize: BLOG_PAGE_SIZE }),
      staleTime: STALE,
    }),
  search: (query: string) =>
    queryOptions({
      queryKey: contentKeys.search(query),
      queryFn: () => getServices().search.search(query),
      staleTime: 60_000,
    }),
};
