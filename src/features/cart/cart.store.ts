import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

interface CartState {
  lines: CartLine[];
  addItem: (input: { variantId: string; quantity: number; snapshot: CartLineSnapshot }) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
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
      clear: () => set({ lines: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
      // Rehydrated after mount (useCartRehydration) so pre-rendered HTML and the first client
      // render match; see ARCHITECTURE.md §14.2 spike S2.
      skipHydration: true,
    },
  ),
);

/** Number of distinct items, shown on the cart badge ("50 chicks" counts as one item). */
export const selectLineCount = (state: CartState): number => state.lines.length;

/** Call once near the root: loads the saved cart after hydration. */
export function useCartRehydration(): void {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);
}
