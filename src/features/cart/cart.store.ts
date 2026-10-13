import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { blankToNull } from "@/lib/text";
import type { MinorUnits, SaleUnit } from "@/types/domain";

// Device-persisted cart (ARCHITECTURE.md §7.3, CART-02). The snapshot is for display only:
// prices, stock and totals always come from the server quote (BR-03).

export interface CartLineSnapshot {
  productSlug: string;
  productName: string;
  variantName: string;
  unit: SaleUnit;
  unitPriceMinor: MinorUnits;
  imageSrc?: string | null;
}

export interface CartLine {
  variantId: string;
  quantity: number;
  addedAt: string;
  snapshot: CartLineSnapshot;
}

/** What is saved on the device (version 2 added the promo code and delivery area). */
export interface PersistedCart {
  lines: CartLine[];
  /** Entered on the cart page; validated by the server quote (CART-06). */
  promoCode: string | null;
  /** Chosen for the delivery estimate (CART-05); checkout starts from it. */
  deliveryAreaId: string | null;
}

interface CartState extends PersistedCart {
  addItem: (input: { variantId: string; quantity: number; snapshot: CartLineSnapshot }) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  /** Records the latest server details for a line, e.g. after the customer accepts a new price. */
  updateSnapshot: (variantId: string, snapshot: Partial<CartLineSnapshot>) => void;
  /** Replaces the cart, e.g. "Order again" (CART-08). */
  replaceAll: (
    lines: { variantId: string; quantity: number; snapshot: CartLineSnapshot }[],
  ) => void;
  setPromoCode: (code: string | null) => void;
  setDeliveryAreaId: (areaId: string | null) => void;
  /** Empties the cart after an order is placed. */
  clear: () => void;
}

export const CART_STORE_VERSION = 2;

/** Upgrades a saved cart from any earlier version (zustand persist `migrate`). */
export function migrateCart(persisted: unknown, version: number): PersistedCart {
  const saved = (persisted ?? {}) as Partial<PersistedCart>;
  const lines = Array.isArray(saved.lines) ? saved.lines : [];
  if (version < 2) return { lines, promoCode: null, deliveryAreaId: null };
  return {
    lines,
    promoCode: saved.promoCode ?? null,
    deliveryAreaId: saved.deliveryAreaId ?? null,
  };
}

function assertQuantity(quantity: number): void {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new RangeError(`Cart quantities must be whole numbers, received ${quantity}`);
  }
}

export const CART_STORAGE_KEY = "phk-cart";

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      promoCode: null,
      deliveryAreaId: null,
      addItem: ({ variantId, quantity, snapshot }) => {
        assertQuantity(quantity);
        if (quantity === 0) return;
        set((state) => {
          const existing = state.lines.find((line) => line.variantId === variantId);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.variantId === variantId
                  ? { ...line, quantity: line.quantity + quantity, snapshot }
                  : line,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              { variantId, quantity, snapshot, addedAt: new Date().toISOString() },
            ],
          };
        });
      },
      setQuantity: (variantId, quantity) => {
        assertQuantity(quantity);
        set((state) => ({
          lines:
            quantity === 0
              ? state.lines.filter((line) => line.variantId !== variantId)
              : state.lines.map((line) =>
                  line.variantId === variantId ? { ...line, quantity } : line,
                ),
        }));
      },
      removeItem: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      updateSnapshot: (variantId, snapshot) =>
        set((state) => ({
          lines: state.lines.map((line) =>
            line.variantId === variantId
              ? { ...line, snapshot: { ...line.snapshot, ...snapshot } }
              : line,
          ),
        })),
      replaceAll: (lines) => {
        for (const line of lines) assertQuantity(line.quantity);
        const addedAt = new Date().toISOString();
        set({ lines: lines.filter((l) => l.quantity > 0).map((l) => ({ ...l, addedAt })) });
      },
      setPromoCode: (code) => set({ promoCode: blankToNull(code)?.toUpperCase() ?? null }),
      setDeliveryAreaId: (areaId) => set({ deliveryAreaId: areaId }),
      clear: () => set({ lines: [], promoCode: null }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORE_VERSION,
      migrate: migrateCart,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedCart => ({
        lines: state.lines,
        promoCode: state.promoCode,
        deliveryAreaId: state.deliveryAreaId,
      }),
      // Rehydrated after mount (useCartRehydration) so pre-rendered HTML and the first client
      // render match; see ARCHITECTURE.md §14.2 spike S2.
      skipHydration: true,
    },
  ),
);

/** Number of distinct items, shown on the cart badge ("50 chicks" counts as one item). */
export const selectLineCount = (state: CartState): number => state.lines.length;

const subscribeToRehydration = (onChange: () => void) =>
  useCartStore.persist.onFinishHydration(onChange);

/**
 * True once the saved cart has been loaded. Pages that show the cart wait for it, so they never
 * flash "Your cart is empty" before the saved lines arrive.
 */
export function useCartReady(): boolean {
  return useSyncExternalStore(
    subscribeToRehydration,
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}

/** Call once near the root: loads the saved cart after hydration. */
export function useCartRehydration(): void {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
}
