import { beforeEach, describe, expect, it } from "vitest";

import {
  CHECKOUT_DRAFT_KEY,
  clearCheckoutDraft,
  readCheckoutDraft,
  writeCheckoutDraft,
} from "./checkout-draft";
import { EMPTY_CHECKOUT } from "./checkout-form";

describe("checkout draft (CHK-03)", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("starts empty", () => {
    expect(readCheckoutDraft()).toEqual({ values: EMPTY_CHECKOUT, idempotencyKey: null });
  });

  it("round-trips the values and the idempotency key", () => {
    const values = { ...EMPTY_CHECKOUT, name: "Jane", fulfilment: "collection" as const };
    writeCheckoutDraft({ values, idempotencyKey: "key-1" });
    expect(readCheckoutDraft()).toEqual({ values, idempotencyKey: "key-1" });
    clearCheckoutDraft();
    expect(readCheckoutDraft().values).toEqual(EMPTY_CHECKOUT);
  });

  it("drops unknown fields and invalid choices from an edited or old draft", () => {
    window.sessionStorage.setItem(
      CHECKOUT_DRAFT_KEY,
      JSON.stringify({
        values: {
          name: "Jane",
          fulfilment: "drone",
          paymentMethod: "bitcoin",
          phone: 712,
          extra: "x",
        },
        idempotencyKey: 42,
      }),
    );
    expect(readCheckoutDraft()).toEqual({
      values: { ...EMPTY_CHECKOUT, name: "Jane" },
      idempotencyKey: null,
    });
  });

  it("survives unreadable storage", () => {
    window.sessionStorage.setItem(CHECKOUT_DRAFT_KEY, "{not json");
    expect(readCheckoutDraft().values).toEqual(EMPTY_CHECKOUT);
  });
});
