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
  quotes: () => ["cart", "quote"] as const,
  quote: (input: CartQuoteInput) => ["cart", "quote", input] as const,
};

/**
 * The server's quote for the current cart (CART-04, BR-03): prices, stock issues, discount and
 * delivery fee. Recomputed whenever lines or options change (stale time 0, ARCHITECTURE.md §7.2);
 * the previous quote stays on screen while the new one loads, so totals don't flash.
 *
 * Without options it uses the cart's saved promo code and estimate area (cart page and drawer);
 * checkout passes its own fulfilment choice.
 */
export function useCartQuote(options?: QuoteOptions) {
  const hydrated = useHydrated();
  const lines = useCartStore((state) => state.lines);
  const savedPromo = useCartStore((state) => state.promoCode);
  const savedArea = useCartStore((state) => state.deliveryAreaId);
  const resolved: QuoteOptions = options ?? {
    fulfilment: savedArea ? "delivery" : undefined,
    deliveryAreaId: savedArea,
    promoCode: savedPromo,
  };
  const input: CartQuoteInput = {
    items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
    fulfilment: resolved.fulfilment,
    deliveryAreaId: resolved.deliveryAreaId ?? null,
    pickupLocationId: resolved.pickupLocationId ?? null,
    promoCode: resolved.promoCode ?? null,
  };
  return useQuery({
    queryKey: cartKeys.quote(input),
    queryFn: () => getServices().orders.quoteCart(input),
    enabled: hydrated && input.items.length > 0,
    staleTime: 0,
    placeholderData: keepPreviousData,
  });
}

/** Line issues that must be fixed before checkout (pick-up-only notes are handled there). */
export function hasBlockingLineIssues(
  quote: { lines: { issues: { code: string }[] }[] } | undefined,
) {
  return (
    quote?.lines.some((line) => line.issues.some((issue) => issue.code !== "COLLECTION_ONLY")) ??
    false
  );
}
