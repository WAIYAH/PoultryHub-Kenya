import { describe, expect, it } from "vitest";

import {
  EMPTY_CHECKOUT,
  checkoutSchema,
  serverFieldErrors,
  toPlaceOrderInput,
  type CheckoutValues,
} from "./checkout-form";

const delivery: CheckoutValues = {
  ...EMPTY_CHECKOUT,
  name: "Jane Wanjiru",
  phone: "0712 345 678",
  fulfilment: "delivery",
  county: "Kiambu",
  deliveryAreaId: "area-ruiru",
  town: "Ruiru",
  addressLine: "Greenfield Estate, House 14",
  paymentMethod: "mpesa_stk",
};

const collection: CheckoutValues = {
  ...EMPTY_CHECKOUT,
  name: "Jane Wanjiru",
  phone: "0712345678",
  fulfilment: "collection",
  pickupLocationId: "pickup-farm-gate",
  paymentMethod: "pay_on_collection",
};

function errorPaths(values: CheckoutValues): string[] {
  const result = checkoutSchema.safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("checkout form (CHK-02, CHK-03)", () => {
  it("accepts a complete delivery order and a complete pick-up order", () => {
    expect(errorPaths(delivery)).toEqual([]);
    expect(errorPaths(collection)).toEqual([]);
  });

  it("reports every missing field at once, including the conditional ones", () => {
    expect(errorPaths({ ...EMPTY_CHECKOUT }).sort()).toEqual(
      ["addressLine", "county", "deliveryAreaId", "name", "paymentMethod", "phone", "town"].sort(),
    );
    expect(errorPaths({ ...EMPTY_CHECKOUT, fulfilment: "collection" }).sort()).toEqual(
      ["name", "paymentMethod", "phone", "pickupLocationId"].sort(),
    );
  });

  it("checks delivery fields only for delivery, and the pick-up point only for pick-up", () => {
    expect(errorPaths({ ...collection, deliveryAreaId: "", addressLine: "" })).toEqual([]);
    expect(errorPaths({ ...delivery, pickupLocationId: "" })).toEqual([]);
  });

  it("accepts Kenyan mobile formats (KM-2) and rejects anything else", () => {
    for (const phone of ["0712345678", "+254 712 345 678", "254112345678", "0712-345-678"]) {
      expect(errorPaths({ ...delivery, phone })).toEqual([]);
    }
    for (const phone of ["0812345678", "071234567", "12345", ""]) {
      expect(errorPaths({ ...delivery, phone })).toEqual(["phone"]);
    }
  });

  it("allows a blank email but not a malformed one", () => {
    expect(errorPaths({ ...delivery, email: "  " })).toEqual([]);
    expect(errorPaths({ ...delivery, email: "jane@example" })).toEqual(["email"]);
  });

  it("limits free-text lengths", () => {
    expect(errorPaths({ ...delivery, directions: "x".repeat(501) })).toEqual(["directions"]);
    expect(errorPaths({ ...delivery, note: "x".repeat(501) })).toEqual(["note"]);
  });

  it("does not accept whitespace as an address", () => {
    expect(errorPaths({ ...delivery, addressLine: "       " })).toEqual(["addressLine"]);
  });
});

describe("toPlaceOrderInput", () => {
  const options = {
    items: [{ variantId: "v1", quantity: 2 }],
    promoCode: "KARIBU10",
    expectedTotalMinor: 119_000,
    idempotencyKey: "key-1",
  };

  it("builds a delivery order with a normalised phone and blank optionals as null", () => {
    expect(toPlaceOrderInput({ ...delivery, email: " ", directions: "  " }, options)).toEqual({
      idempotencyKey: "key-1",
      customer: { name: "Jane Wanjiru", phone: "+254712345678", email: null },
      items: [{ variantId: "v1", quantity: 2 }],
      fulfilment: {
        method: "delivery",
        deliveryAreaId: "area-ruiru",
        town: "Ruiru",
        addressLine: "Greenfield Estate, House 14",
        directions: null,
        instructions: null,
      },
      paymentMethod: "mpesa_stk",
      promoCode: "KARIBU10",
      note: null,
      expectedTotalMinor: 119_000,
    });
  });

  it("sends only the pick-up point for collection", () => {
    expect(toPlaceOrderInput(collection, options).fulfilment).toEqual({
      method: "collection",
      pickupLocationId: "pickup-farm-gate",
    });
  });
});

describe("serverFieldErrors", () => {
  it("maps the server's field paths onto form fields and drops unknown ones", () => {
    expect(
      serverFieldErrors({
        "customer.phone": "Enter a Kenyan mobile number.",
        "fulfilment.deliveryAreaId": "Choose a delivery area.",
        items: "Your cart is empty.",
      }),
    ).toEqual({
      phone: "Enter a Kenyan mobile number.",
      deliveryAreaId: "Choose a delivery area.",
    });
    expect(serverFieldErrors(undefined)).toEqual({});
  });
});
