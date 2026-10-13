import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEMO_ACCOUNT } from "@/mocks/fixtures/accounts";
import { products } from "@/mocks/fixtures/catalog";
import { AppError } from "@/lib/errors";
import type { PlaceOrderInput } from "@/types/domain";

import { createMockServices } from ".";
import { SCENARIO_STORAGE_KEY } from "./scenario";

// The mock data source must behave like the planned backend, rule for rule, so the Phase 2
// screens are built against realistic behaviour (TESTING.md §5, rows 1–6 and 11).

let services: ReturnType<typeof createMockServices>;

beforeEach(() => {
  window.sessionStorage.clear();
  services = createMockServices();
});

afterEach(() => {
  vi.useRealTimers();
});

const useScenario = (value: string) => window.sessionStorage.setItem(SCENARIO_STORAGE_KEY, value);

async function rejection(promise: Promise<unknown>): Promise<AppError> {
  const error: unknown = await promise.then(
    () => null,
    (reason: unknown) => reason,
  );
  if (!(error instanceof AppError)) throw new Error(`Expected an AppError, got ${String(error)}`);
  return error;
}

function orderInput(overrides: Partial<PlaceOrderInput> = {}): PlaceOrderInput {
  return {
    idempotencyKey: crypto.randomUUID(),
    customer: { name: "Jane Wanjiru", phone: "0712 345 678", email: null },
    items: [{ variantId: "var-eggs-tray-large", quantity: 2 }],
    fulfilment: {
      method: "delivery",
      deliveryAreaId: "area-ruiru",
      town: "Ruiru",
      addressLine: "Kamakis, Greenfield Estate, House 14",
    },
    paymentMethod: "mpesa_stk",
    expectedTotalMinor: 130_000, // 2 × KSh 550 + KSh 200 delivery
    ...overrides,
  };
}

describe("catalogue (CAT-01, CAT-02, CAT-12)", () => {
  it("has about 20 sample products across every category, all flagged SAMPLE", async () => {
    const { items, total } = await services.catalog.listProducts({ pageSize: 100 });
    expect(total).toBe(products.length);
    expect(total).toBeGreaterThanOrEqual(20);
    for (const product of products) {
      for (const variant of product.variants) expect(variant.sku).toMatch(/^SAMPLE-/);
    }
    const categories = await services.catalog.listCategories();
    for (const category of categories) {
      expect(items.some((p) => p.category.slug === category.slug)).toBe(true);
      expect(category.fromPriceMinor).not.toBeNull();
    }
  });

  it("filters by category, availability and price", async () => {
    const chicks = await services.catalog.listProducts({ category: "day-old-chicks" });
    expect(chicks.items.every((p) => p.category.slug === "day-old-chicks")).toBe(true);

    const preOrder = await services.catalog.listProducts({ availability: ["pre_order"] });
    expect(preOrder.items.map((p) => p.slug)).toContain("broiler-chicks");

    const cheap = await services.catalog.listProducts({ maxPriceMinor: 30_000 });
    expect(cheap.items.every((p) => p.fromPriceMinor <= 30_000)).toBe(true);
  });

  it("finds products by Swahili synonyms", async () => {
    const mayai = await services.catalog.listProducts({ q: "mayai" });
    expect(mayai.items.map((p) => p.slug)).toContain("farm-fresh-eggs");
    const vifaranga = await services.catalog.listProducts({ q: "vifaranga" });
    expect(vifaranga.items.map((p) => p.slug)).toContain("improved-kienyeji-chicks");
  });

  it("paginates 24 per page by default (CAT-03)", async () => {
    const first = await services.catalog.listProducts({ pageSize: 8, page: 1 });
    const third = await services.catalog.listProducts({ pageSize: 8, page: 3 });
    expect(first.items).toHaveLength(8);
    expect(third.items).toHaveLength(products.length - 16);
  });

  it("returns empty lists under ?mock=empty and fails under ?mock=error", async () => {
    useScenario("empty");
    expect((await services.catalog.listProducts()).items).toEqual([]);
    useScenario("error");
    expect((await rejection(services.catalog.listProducts())).code).toBe("NETWORK");
  });
});

describe("cart quote (CART-04, BR-03, BR-06, BR-13, BR-14, BR-30)", () => {
  it("prices lines from the catalogue, not the client", async () => {
    const quote = await services.orders.quoteCart({
      items: [{ variantId: "var-eggs-tray-large", quantity: 2 }],
      fulfilment: "delivery",
      deliveryAreaId: "area-ruiru",
    });
    expect(quote.lines[0]).toMatchObject({ unitPriceMinor: 55_000, lineTotalMinor: 110_000 });
    expect(quote).toMatchObject({
      subtotalMinor: 110_000,
      deliveryFeeMinor: 20_000,
      totalMinor: 130_000,
    });
    expect(quote.delivery?.zoneName).toBe("Thika Road corridor");
  });

  it("BR-06 flags quantities off the step", async () => {
    const quote = await services.orders.quoteCart({
      items: [{ variantId: "var-chicks-kienyeji", quantity: 55 }],
    });
    expect(quote.lines[0]?.issues).toContainEqual({
      code: "QUANTITY_RULE",
      min: 50,
      step: 10,
      max: 1_000,
    });
  });

  it("flags more than the stock available", async () => {
    const quote = await services.orders.quoteCart({
      items: [{ variantId: "var-eggs-tray-medium", quantity: 9 }],
    });
    expect(quote.lines[0]?.issues).toContainEqual({ code: "INSUFFICIENT_STOCK", available: 8 });
  });

  it("BR-14 flags pick-up-only items when delivery is chosen", async () => {
    const quote = await services.orders.quoteCart({
      items: [{ variantId: "var-chicks-kienyeji", quantity: 50 }],
      fulfilment: "delivery",
      deliveryAreaId: "area-ruiru",
    });
    expect(quote.lines[0]?.issues).toContainEqual({ code: "COLLECTION_ONLY" });
  });

  it("BR-13 makes delivery free at the zone threshold and enforces zone minimums", async () => {
    const free = await services.orders.quoteCart({
      items: [{ variantId: "var-eggs-tray-large", quantity: 6 }], // KSh 3,300 ≥ KSh 3,000
      fulfilment: "delivery",
      deliveryAreaId: "area-ruiru",
    });
    expect(free.deliveryFeeMinor).toBe(0);

    const small = await services.orders.quoteCart({
      items: [{ variantId: "var-drinker-4", quantity: 1 }], // KSh 250 < KSh 1,000 minimum
      fulfilment: "delivery",
      deliveryAreaId: "area-kilimani",
    });
    expect(small.issues).toContainEqual({ code: "BELOW_MINIMUM_ORDER", minimumMinor: 100_000 });
  });

  it("BR-30 applies valid promo codes and explains invalid ones", async () => {
    const items = [{ variantId: "var-eggs-tray-large", quantity: 4 }]; // KSh 2,200
    const valid = await services.orders.quoteCart({ items, promoCode: "karibu10" });
    expect(valid.discountMinor).toBe(22_000);
    expect(valid.promo?.code).toBe("KARIBU10");

    const expired = await services.orders.quoteCart({ items, promoCode: "EASTER25" });
    expect(expired.discountMinor).toBe(0);
    expect(expired.issues).toContainEqual({
      code: "PROMO_INVALID",
      reason: "This code has expired.",
    });

    const tooSmall = await services.orders.quoteCart({ items, promoCode: "BULK500" });
    expect(tooSmall.issues[0]).toMatchObject({ code: "PROMO_INVALID" });
  });

  it("leaves the delivery fee open until an area is chosen (CART-05)", async () => {
    const quote = await services.orders.quoteCart({
      items: [{ variantId: "var-eggs-tray-large", quantity: 1 }],
    });
    expect(quote.deliveryFeeMinor).toBeNull();
    expect(quote.totalMinor).toBe(55_000);
  });
});

describe("placing orders (CHK-05, BR-03, BR-08, BR-17, BR-29)", () => {
  it("creates a pending order, holds stock and returns a tracking link", async () => {
    const placed = await services.orders.placeOrder(orderInput());
    expect(placed).toMatchObject({
      orderNumber: "PH001101",
      status: "pending",
      paymentStatus: "unpaid",
      totalMinor: 130_000,
      nextAction: "mpesa_stk",
    });
    expect(placed.trackingPath).toBe(`/orders/PH001101?token=${placed.accessToken}`);

    const eggs = await services.catalog.getProduct("farm-fresh-eggs");
    expect(eggs?.variants.find((v) => v.id === "var-eggs-tray-large")?.stockQuantity).toBe(118);
  });

  it("NFR-REL-1 replays the same order for the same idempotency key", async () => {
    const input = orderInput();
    const first = await services.orders.placeOrder(input);
    const second = await services.orders.placeOrder(input);
    expect(second.orderNumber).toBe(first.orderNumber);
  });

  it("AC-2 rejects a tampered or stale total with PRICE_CHANGED and a fresh quote", async () => {
    const error = await rejection(
      services.orders.placeOrder(orderInput({ expectedTotalMinor: 200 })),
    );
    expect(error.code).toBe("PRICE_CHANGED");
    expect(error.details?.quote).toMatchObject({ totalMinor: 130_000 });
  });

  it("J4: a price change between checkout and submit gives PRICE_CHANGED", async () => {
    useScenario("price-changed");
    const error = await rejection(services.orders.placeOrder(orderInput()));
    expect(error.code).toBe("PRICE_CHANGED");
    expect(error.details?.quote).toMatchObject({ totalMinor: 134_000 }); // + KSh 20 per tray
  });

  it("rejects more than the stock with INSUFFICIENT_STOCK", async () => {
    useScenario("low-stock");
    const error = await rejection(services.orders.placeOrder(orderInput()));
    expect(error.code).toBe("INSUFFICIENT_STOCK");
  });

  it("rejects a closed area with AREA_NOT_SERVED", async () => {
    useScenario("area-closed");
    expect((await rejection(services.orders.placeOrder(orderInput()))).code).toBe(
      "AREA_NOT_SERVED",
    );
  });

  it("BR-17 refuses pay at pick-up for a delivery order", async () => {
    const error = await rejection(
      services.orders.placeOrder(orderInput({ paymentMethod: "pay_on_collection" })),
    );
    expect(error.code).toBe("PAYMENT_METHOD_UNAVAILABLE");
  });

  it("KM-2 rejects phone numbers that aren't Kenyan mobiles", async () => {
    const error = await rejection(
      services.orders.placeOrder(
        orderInput({ customer: { name: "Jane", phone: "020 123 4567", email: null } }),
      ),
    );
    expect(error.code).toBe("VALIDATION_FAILED");
    expect(error.details?.fields).toHaveProperty(["customer.phone"]);
  });

  it("BR-29 caps open unpaid orders per phone at 3", async () => {
    for (let i = 0; i < 3; i += 1) await services.orders.placeOrder(orderInput());
    expect((await rejection(services.orders.placeOrder(orderInput()))).code).toBe(
      "TOO_MANY_OPEN_ORDERS",
    );
  });

  it("places pick-up orders with pay at pick-up", async () => {
    const placed = await services.orders.placeOrder(
      orderInput({
        items: [{ variantId: "var-chicks-kienyeji", quantity: 50 }],
        fulfilment: { method: "collection", pickupLocationId: "pickup-farm" },
        paymentMethod: "pay_on_collection",
        expectedTotalMinor: 600_000,
      }),
    );
    expect(placed.nextAction).toBe("await_confirmation");
  });
});

describe("order access and tracking (BR-25, BR-28, CHK-07)", () => {
  it("BR-28 shows a guest order only with its token", async () => {
    const placed = await services.orders.placeOrder(orderInput());
    const withToken = await services.orders.getOrder({
      orderNumber: placed.orderNumber,
      token: placed.accessToken,
    });
    expect(withToken?.customerName).toBe("Jane Wanjiru");
    expect(withToken?.accessToken).toBe(placed.accessToken);
    expect(
      await services.orders.getOrder({ orderNumber: placed.orderNumber, token: "wrong" }),
    ).toBeNull();
    expect(await services.orders.getOrder({ orderNumber: placed.orderNumber })).toBeNull();
  });

  it("CHK-07 tracks by number and phone with status only", async () => {
    const placed = await services.orders.placeOrder(orderInput());
    const tracking = await services.orders.trackOrder({
      orderNumber: placed.orderNumber.toLowerCase(),
      phone: "+254 712 345 678",
    });
    expect(tracking).toMatchObject({ orderNumber: placed.orderNumber, status: "pending" });
    expect(JSON.stringify(tracking)).not.toContain("Jane");
    expect(
      await services.orders.trackOrder({ orderNumber: placed.orderNumber, phone: "0799 999 999" }),
    ).toBeNull();
  });

  it("BR-25 lets customers cancel pending orders only, releasing the stock", async () => {
    const placed = await services.orders.placeOrder(orderInput());
    const ref = { orderNumber: placed.orderNumber, token: placed.accessToken };
    await services.orders.cancelPendingOrder(ref);
    expect((await services.orders.getOrder(ref))?.status).toBe("cancelled");
    const eggs = await services.catalog.getProduct("farm-fresh-eggs");
    expect(eggs?.variants[0]?.stockQuantity).toBe(120);
    expect((await rejection(services.orders.cancelPendingOrder(ref))).code).toBe("NOT_CANCELLABLE");
  });

  it("AC-4 expires unpaid M-Pesa orders after the hold and releases their stock", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-13T08:00:00Z"));
    const placed = await services.orders.placeOrder(orderInput());
    vi.setSystemTime(new Date("2026-10-13T08:31:00Z"));
    const order = await services.orders.getOrder({
      orderNumber: placed.orderNumber,
      token: placed.accessToken,
    });
    expect(order?.status).toBe("cancelled");
    expect(order?.events.at(-1)?.label).toBe("Cancelled: payment not received");
  });

  it("lists the signed-in customer's orders, newest first (ORD-03)", async () => {
    expect((await rejection(services.orders.listMyOrders())).code).toBe("UNAUTHENTICATED");
    await services.auth.signIn(DEMO_ACCOUNT);
    const { items } = await services.orders.listMyOrders();
    expect(items.map((o) => o.orderNumber)).toEqual(["PH001002", "PH001001"]);
  });
});

describe("mock M-Pesa payments (PAY-01, PAY-02, BR-19, BR-21)", () => {
  async function pendingPayment() {
    const placed = await services.orders.placeOrder(orderInput());
    const ref = { orderNumber: placed.orderNumber, token: placed.accessToken };
    const attempt = await services.payments.startMpesaPayment({
      ...ref,
      phone: "0712345678",
      idempotencyKey: crypto.randomUUID(),
    });
    return { ref, attempt };
  }

  it("starts one attempt at a time for the server's total", async () => {
    const { ref, attempt } = await pendingPayment();
    expect(attempt.status).toBe("pending");
    expect(attempt.customerMessage).toContain("KSh 1,300");
    const again = await services.payments.startMpesaPayment({
      ...ref,
      phone: "0712345678",
      idempotencyKey: crypto.randomUUID(),
    });
    expect(again.id).toBe(attempt.id);
    expect((await services.payments.getPaymentStatus(ref)).paymentStatus).toBe("pending");
  });

  it("confirms the order when the payment succeeds", async () => {
    const { ref, attempt } = await pendingPayment();
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "success" });
    const status = await services.payments.getPaymentStatus(ref);
    expect(status).toMatchObject({ status: "confirmed", paymentStatus: "paid" });
    const order = await services.orders.getOrder(ref);
    expect(order?.payments[0]?.receipt).toMatch(/^MOCK/);
  });

  it("returns to unpaid with the right message when the customer cancels", async () => {
    const { ref, attempt } = await pendingPayment();
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "cancelled" });
    const status = await services.payments.getPaymentStatus(ref);
    expect(status.paymentStatus).toBe("unpaid");
    expect(status.latestAttempt).toMatchObject({
      status: "cancelled",
      resultMessage: "You cancelled the M-Pesa prompt. Try again when ready.",
    });
  });

  it("BR-21 never confirms a late payment on a cancelled order", async () => {
    const { ref, attempt } = await pendingPayment();
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "late_success" });
    const order = await services.orders.getOrder(ref);
    expect(order).toMatchObject({ status: "cancelled", paymentStatus: "paid" });
    expect(order?.events.at(-1)?.label).toBe("Payment received after cancellation");
  });

  it("ignores duplicate outcomes once the attempt is final", async () => {
    const { ref, attempt } = await pendingPayment();
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "success" });
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "cancelled" });
    expect((await services.payments.getPaymentStatus(ref)).paymentStatus).toBe("paid");
  });

  it("refuses to charge an order that is already paid", async () => {
    const { ref, attempt } = await pendingPayment();
    await services.payments.simulate?.({ paymentId: attempt.id, outcome: "success" });
    const error = await rejection(
      services.payments.startMpesaPayment({ ...ref, phone: "0712345678", idempotencyKey: "x" }),
    );
    expect(error.code).toBe("ORDER_NOT_PAYABLE");
  });
});

describe("mock authentication and accounts (ACC-01 to ACC-05)", () => {
  it("signs in the demo account and rejects a wrong password", async () => {
    expect(
      (await rejection(services.auth.signIn({ ...DEMO_ACCOUNT, password: "nope" }))).code,
    ).toBe("INVALID_CREDENTIALS");
    const session = await services.auth.signIn(DEMO_ACCOUNT);
    expect(session.user.email).toBe(DEMO_ACCOUNT.email);
    expect(await services.auth.getSession()).toEqual(session);
  });

  it("requires email confirmation before the first sign-in", async () => {
    const input = {
      fullName: "Achieng Otieno",
      email: "achieng@example.com",
      phone: "0712 345 678",
      password: "a-good-password",
      marketingOptIn: false,
    };
    const result = await services.auth.signUp(input);
    expect((await rejection(services.auth.signIn(input))).code).toBe("EMAIL_NOT_CONFIRMED");
    const code = new URL(result.demoLink ?? "", "http://x").searchParams.get("code") ?? "";
    await services.auth.exchangeCode(code);
    expect((await services.auth.getSession())?.user.fullName).toBe("Achieng Otieno");
    expect((await rejection(services.auth.exchangeCode(code))).code).toBe("NOT_FOUND"); // single use
    expect((await rejection(services.auth.signUp(input))).code).toBe("EMAIL_IN_USE");
  });

  it("resets a password through the emailed link", async () => {
    const { demoLink } = await services.auth.requestPasswordReset(DEMO_ACCOUNT.email);
    const code = new URL(demoLink ?? "", "http://x").searchParams.get("code") ?? "";
    await services.auth.exchangeCode(code);
    await services.auth.updatePassword("new-password");
    await services.auth.signOut();
    await services.auth.signIn({ email: DEMO_ACCOUNT.email, password: "new-password" });
  });

  it("does not reveal whether an account exists", async () => {
    const result = await services.auth.requestPasswordReset("nobody@example.com");
    expect(result).toEqual({ email: "nobody@example.com" });
  });

  it("keeps exactly one default address (ACC-05)", async () => {
    await services.auth.signIn(DEMO_ACCOUNT);
    const added = await services.account.saveAddress({
      label: "Farm",
      recipientName: "Wanjiru Demo",
      phone: "0712345678",
      county: "Kiambu",
      deliveryAreaId: "area-juja",
      town: "Juja",
      addressLine: "Sample farm road",
      directions: null,
      isDefault: true,
    });
    let addresses = await services.account.listAddresses();
    expect(addresses.filter((a) => a.isDefault).map((a) => a.id)).toEqual([added.id]);
    await services.account.deleteAddress(added.id);
    addresses = await services.account.listAddresses();
    expect(addresses.filter((a) => a.isDefault)).toHaveLength(1);
  });

  it("refuses account data when signed out", async () => {
    expect((await rejection(services.account.getProfile())).code).toBe("UNAUTHENTICATED");
  });
});

describe("contact and search (CNT-01, SITE-11)", () => {
  it("validates contact messages", async () => {
    const error = await rejection(
      services.contact.submit({ name: "A", subject: "general", message: "short" }),
    );
    expect(Object.keys(error.details?.fields ?? {})).toEqual(["name", "phone", "message"]);
    await services.contact.submit({
      name: "Achieng",
      phone: "0712 345 678",
      subject: "wholesale_quote",
      message: "Please quote 50 trays a week for our hotel.",
    });
  });

  it("searches products, posts and FAQs together", async () => {
    const results = await services.search.search("eggs");
    expect(results.products.length).toBeGreaterThan(0);
    expect(results.posts.map((p) => p.slug)).toContain("how-to-store-eggs-at-home");
    expect(results.faqs.map((f) => f.id)).toContain("faq-fresh");
  });
});
