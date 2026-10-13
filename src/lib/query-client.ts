import { QueryClient } from "@tanstack/react-query";

import { isRetryableError } from "./errors";

// Defaults from ARCHITECTURE.md §7.2. Individual queries override staleTime where the data
// changes at a different pace (content: 5 min, orders: 0).
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => failureCount < 2 && isRetryableError(error),
        retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
        // Mobile users switch apps constantly; refetching on every focus wastes data.
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}

let browserClient: QueryClient | undefined;

/**
 * One client per browser tab, shared by components and route `clientLoader`s (which prefetch into
 * it, so a page renders from cache without a second request). During pre-rendering every call gets
 * a fresh client, so nothing leaks between pages.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") return createQueryClient();
  browserClient ??= createQueryClient();
  return browserClient;
}
