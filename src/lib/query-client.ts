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
