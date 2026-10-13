import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getServices } from "@/services";
import type { CartQuoteInput, FulfilmentMethod } from "@/types/domain";

import { useCartStore } from "./cart.store";

export interface QuoteOptions {
  fulfilment?: FulfilmentMethod;
  deliveryAreaId?: string | null;
  pickupLocationId?: string | null;
  promoCode?: string | null;
}

export const cartKeys = {
  quote: (input: CartQuoteInput) => ["cart", "quote", input] as const,
};

/**
 * The server's quote for the current cart (CART-04, BR-03): prices, stock issues, discount and
 * delivery fee. Recomputed whenever lines or options change (stale time 0, ARCHITECTURE.md §7.2);
 * the previous quote stays on screen while the new one loads, so totals don't flash.
 */
export function useCartQuote(options: QuoteOptions = {}) {
  const hydrated = useHydrated();
  const lines = useCartStore((state) => state.lines);
  const input: CartQuoteInput = {
    items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    fulfilment: options.fulfilment,
    deliveryAreaId: options.deliveryAreaId ?? null,
    pickupLocationId: options.pickupLocationId ?? null,
    promoCode: options.promoCode ?? null,
  };
  return useQuery({
    queryKey: cartKeys.quote(input),
    queryFn: () => getServices().orders.quoteCart(input),
    enabled: hydrated && input.items.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}
