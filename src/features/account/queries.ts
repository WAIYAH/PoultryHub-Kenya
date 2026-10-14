import { queryOptions } from "@tanstack/react-query";

import { getServices } from "@/services";

// The signed-in customer's own data (FR-ACC). Everything sits under ["account"], so signing in or
// out clears it in one call; the order history sits under ["orders"] with the order pages.

export const accountKeys = {
  all: () => ["account"] as const,
  profile: () => ["account", "profile"] as const,
  addresses: () => ["account", "addresses"] as const,
  orders: (page: number) => ["orders", "mine", page] as const,
};

export const ORDER_HISTORY_PAGE_SIZE = 10;

export const accountQueries = {
  profile: () =>
    queryOptions({
      queryKey: accountKeys.profile(),
      queryFn: () => getServices().account.getProfile(),
    }),
  addresses: () =>
    queryOptions({
      queryKey: accountKeys.addresses(),
      queryFn: () => getServices().account.listAddresses(),
    }),
  orders: (page: number, pageSize = ORDER_HISTORY_PAGE_SIZE) =>
    queryOptions({
      queryKey: [...accountKeys.orders(page), pageSize] as const,
      queryFn: () => getServices().orders.listMyOrders({ page, pageSize }),
      staleTime: 0,
    }),
};
