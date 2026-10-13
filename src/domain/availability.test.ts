import { describe, expect, it } from "vitest";

import { deriveAvailability } from "./availability";

const variant = (
  overrides: Partial<Parameters<typeof deriveAvailability>[0]["variants"][number]> = {},
) => ({
  trackInventory: true,
  stockQuantity: 20,
  lowStockThreshold: 5,
  availableFrom: null,
  ...overrides,
});

describe("deriveAvailability (CAT-11)", () => {
  it("is enquiry for enquiry-only products regardless of stock", () => {
    expect(deriveAvailability({ purchaseMode: "enquiry", variants: [variant()] })).toBe("enquiry");
  });

  it("is in stock above the low-stock threshold", () => {
    expect(deriveAvailability({ purchaseMode: "cart", variants: [variant()] })).toBe("in_stock");
  });

  it("is low stock at or below the threshold", () => {
    expect(
      deriveAvailability({ purchaseMode: "cart", variants: [variant({ stockQuantity: 5 })] }),
    ).toBe("low_stock");
  });

  it("treats untracked variants as in stock", () => {
    expect(
      deriveAvailability({
        purchaseMode: "cart",
        variants: [variant({ trackInventory: false, stockQuantity: 0 })],
      }),
    ).toBe("in_stock");
  });

  it("is pre-order when sold out but a future batch is scheduled", () => {
    expect(
      deriveAvailability(
        {
          purchaseMode: "cart",
          variants: [variant({ stockQuantity: 0, availableFrom: "2026-10-24" })],
        },
        "2026-10-13",
      ),
    ).toBe("pre_order");
  });

  it("is pre-order when a future batch already has capacity to book (D3)", () => {
    expect(
      deriveAvailability(
        {
          purchaseMode: "cart",
          variants: [variant({ stockQuantity: 500, availableFrom: "2026-10-24" })],
        },
        "2026-10-13",
      ),
    ).toBe("pre_order");
  });

  it("is in stock once the batch date arrives", () => {
    expect(
      deriveAvailability(
        {
          purchaseMode: "cart",
          variants: [variant({ stockQuantity: 500, availableFrom: "2026-10-24" })],
        },
        "2026-10-24",
      ),
    ).toBe("in_stock");
  });

  it("is out of stock when nothing is sellable or scheduled", () => {
    expect(
      deriveAvailability({ purchaseMode: "cart", variants: [variant({ stockQuantity: 0 })] }),
    ).toBe("out_of_stock");
    expect(deriveAvailability({ purchaseMode: "cart", variants: [] })).toBe("out_of_stock");
  });
});
