import { useCallback } from "react";
import { useSearchParams } from "react-router";

import { useHydrated } from "@/lib/hooks/use-hydrated";

import {
  DEFAULT_SHOP_STATE,
  parseShopParams,
  shopSearchParams,
  updateShopState,
  type ShopState,
} from "./shop-params";

/**
 * Shop filters from the URL. Pre-rendered shop pages are built without a query string, so until
 * hydration this returns the defaults (the HTML and the first client render must match,
 * ARCHITECTURE.md §4); the real filters apply right after.
 */
export function useShopState() {
  const hydrated = useHydrated();
  const [searchParams, setSearchParams] = useSearchParams();
  const state = hydrated ? parseShopParams(searchParams) : DEFAULT_SHOP_STATE;

  const update = useCallback(
    (change: Partial<ShopState>, options: { keepScroll?: boolean } = {}) => {
      // Each change is a history entry, so Back restores the previous filters (TESTING.md §5).
      setSearchParams(shopSearchParams(updateShopState(state, change)), {
        preventScrollReset: options.keepScroll ?? true,
      });
    },
    [setSearchParams, state],
  );

  return { state, update, hydrated };
}
