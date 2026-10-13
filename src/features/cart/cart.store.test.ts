import { beforeEach, describe, expect, it } from "vitest";

import {
  CART_STORAGE_KEY,
  selectLineCount,
  useCartStore,
  type CartLineSnapshot,
} from "./cart.store";

const snapshot: CartLineSnapshot = {
  productSlug: "farm-fresh-eggs",
  productName: "Farm fresh eggs",
  variantName: "Tray of 30 (large)",
  unit: "tray",
  unitPriceMinor: 55_000,
};

beforeEach(() => {
  useCartStore.setState({ lines: [] });
});

describe("cart store (CART-01, CART-02)", () => {
  it("adds items and merges repeated variants", () => {
    const { addItem } = useCartStore.getState();
    addItem({ variantId: "v1", quantity: 2, snapshot });
    addItem({ variantId: "v1", quantity: 3, snapshot });
    addItem({ variantId: "v2", quantity: 50, snapshot: { ...snapshot, unit: "chick" } });

    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(2);
    expect(lines.find((l) => l.variantId === "v1")?.quantity).toBe(5);
    expect(selectLineCount(useCartStore.getState())).toBe(2);
  });

  it("sets quantities and removes a line at zero", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    addItem({ variantId: "v1", quantity: 2, snapshot });
    setQuantity("v1", 7);
    expect(useCartStore.getState().lines[0]?.quantity).toBe(7);
    setQuantity("v1", 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it("rejects fractional or negative quantities", () => {
    const { addItem, setQuantity } = useCartStore.getState();
    expect(() => addItem({ variantId: "v1", quantity: 1.5, snapshot })).toThrow(RangeError);
    expect(() => setQuantity("v1", -1)).toThrow(RangeError);
  });

  it("persists lines to localStorage and restores them on rehydrate", async () => {
    useCartStore.getState().addItem({ variantId: "v1", quantity: 2, snapshot });
    const saved = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "{}") as {
      state: { lines: unknown[] };
      version: number;
    };
    expect(saved.version).toBe(1);
    expect(saved.state.lines).toHaveLength(1);

    useCartStore.setState({ lines: [] }, false);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(saved));
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().lines[0]?.quantity).toBe(2);
  });
});
