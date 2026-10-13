import { queryOptions } from "@tanstack/react-query";

import { getServices } from "@/services";

// Delivery configuration changes rarely: 5-minute stale time (ARCHITECTURE.md §7.2).
const STALE = 5 * 60_000;

export const deliveryKeys = {
  zones: () => ["delivery", "zones"] as const,
  areas: () => ["delivery", "areas"] as const,
  pickups: () => ["delivery", "pickups"] as const,
};

export const deliveryQueries = {
  zones: () =>
    queryOptions({
      queryKey: deliveryKeys.zones(),
      queryFn: () => getServices().delivery.listZones(),
      staleTime: STALE,
    }),
  areas: () =>
    queryOptions({
      queryKey: deliveryKeys.areas(),
      queryFn: () => getServices().delivery.listAreas(),
      staleTime: STALE,
    }),
  pickups: () =>
    queryOptions({
      queryKey: deliveryKeys.pickups(),
      queryFn: () => getServices().delivery.listPickupLocations(),
      staleTime: STALE,
    }),
};
