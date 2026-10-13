import { formatKES } from "@/domain/money";
import { orderStatusLabel } from "@/domain/order-status";
import { isPaymentMethodAllowed } from "@/domain/payment-methods";
import { normalizeKenyanMobile } from "@/domain/phone";
import { siteSettings } from "@/mocks/fixtures/content";
import { AppError } from "@/lib/errors";
import { randomId } from "@/lib/ids";
import { blankToNull } from "@/lib/text";
import type {
  OrderDetail,
  OrderEvent,
  OrderRef,
  OrderSummary,
  OrderTracking,
  PlacedOrder,
  PlaceOrderInput,
} from "@/types/domain";

import type { OrderService } from "../contracts";

import { storefrontProducts } from "./catalog";
import { mockRequest } from "./latency";
import { computeQuote, findDeliveryArea, findPickupLocation } from "./quote";
import { mutateState, readState, type DemoOrder, type DemoState } from "./state";

const MAX_OPEN_UNPAID_PER_PHONE = 3; // BR-29 default
const ATTEMPT_TIMEOUT_MS = 10 * 60_000; // API_AND_INTEGRATIONS.md §5.2 reconcile window

function event(type: OrderEvent["type"], label: string, message?: string): OrderEvent {
  return { type, label, at: new Date().toISOString(), ...(message ? { message } : {}) };
}

/**
 * What the scheduled jobs would have done by now (ARCHITECTURE.md §8.3): expire payment attempts
 * left pending past the reconcile window, then cancel unpaid M-Pesa orders past their stock hold
 * (BR-09, AC-4), which releases their stock.
 */
export function settleOrders(state: DemoState, now: number = Date.now()): void {
  for (const order of state.orders) {
    for (const payment of order.payments) {
      if (payment.status === "pending" && now - Date.parse(payment.at) > ATTEMPT_TIMEOUT_MS) {
        payment.status = "expired";
        payment.resultMessage = "The prompt expired. Send a new one.";
        if (order.paymentStatus === "pending") order.paymentStatus = "unpaid";
      }
    }
    const inFlight = order.payments.some((payment) => payment.status === "pending");
    if (
      order.status === "pending" &&
      order.paymentMethod === "mpesa_stk" &&
      order.paymentStatus === "unpaid" &&
      order.reservedUntil !== null &&
      now > Date.parse(order.reservedUntil) &&
      !inFlight
    ) {
      order.status = "cancelled";
      order.events.push({
        type: "status_changed",
        label: "Cancelled: payment not received",
        message: "The payment window closed, so the items went back on sale.",
        at: order.reservedUntil,
      });
    }
  }
}

function currentUserId(state: DemoState): string | null {
  return state.sessionUserId;
}

/** BR-28: the signed-in owner, or anyone holding the order's secret token. */
export function findAccessibleOrder(state: DemoState, ref: OrderRef): DemoOrder | null {
  const order = state.orders.find((o) => o.orderNumber === ref.orderNumber.toUpperCase());
  if (!order) return null;
  if (ref.token && ref.token === order.accessToken) return order;
  const userId = currentUserId(state);
  if (userId !== null && order.customerId === userId) return order;
  return null;
}

export function toOrderDetail(order: DemoOrder, ref: OrderRef): OrderDetail {
  const pickup = order.pickupLocationId ? findPickupLocation(order.pickupLocationId) : null;
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    fulfilmentMethod: order.fulfilmentMethod,
    placedAt: order.placedAt,
    customerName: order.customer.name,
    customerPhone: order.customer.phone,
    customerEmail: order.customer.email,
    items: order.items.map(({ variantId: _variantId, ...item }) => item),
    subtotalMinor: order.subtotalMinor,
    discountMinor: order.discountMinor,
    deliveryFeeMinor: order.deliveryFeeMinor,
    totalMinor: order.totalMinor,
    promoCode: order.promoCode,
    delivery: order.delivery
      ? (({ areaId: _areaId, ...delivery }) => delivery)(order.delivery)
      : null,
    pickup: pickup
      ? {
          name: pickup.name,
          addressLine: pickup.addressLine,
          directions: pickup.directions,
          openingHours: pickup.openingHours,
          mapUrl: pickup.mapUrl,
        }
      : null,
    note: order.note,
    events: [...order.events],
    payments: order.payments.map(({ id: _id, ...payment }) => payment),
    reservedUntil: order.status === "pending" ? order.reservedUntil : null,
    accessToken: ref.token && ref.token === order.accessToken ? order.accessToken : null,
  };
}

function validateInput(input: PlaceOrderInput): { phone: string } {
  const fields: Record<string, string> = {};
  if (input.customer.name.trim().length < 2) fields["customer.name"] = "Enter your name.";
  const phone = normalizeKenyanMobile(input.customer.phone);
  if (!phone) fields["customer.phone"] = "Enter a Kenyan mobile number, e.g. 0712 345 678.";
  const email = input.customer.email?.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields["customer.email"] = "Enter a valid email address.";
  }
  if (input.items.length === 0) fields.items = "Your cart is empty.";
  if (input.items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
    fields.items = "Quantities must be whole numbers.";
  }
  if (input.fulfilment.method === "delivery") {
    if (!findDeliveryArea(input.fulfilment.deliveryAreaId)) {
      fields["fulfilment.deliveryAreaId"] = "Choose a delivery area.";
    }
    if (input.fulfilment.town.trim().length < 2) fields["fulfilment.town"] = "Enter your town.";
    if (input.fulfilment.addressLine.trim().length < 5) {
      fields["fulfilment.addressLine"] = "Enter your estate, street or building.";
    }
  } else if (!findPickupLocation(input.fulfilment.pickupLocationId)) {
    fields["fulfilment.pickupLocationId"] = "Choose a pick-up point.";
  }
  if (!phone || Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_FAILED", undefined, { fields });
  }
  return { phone };
}

function placedResponse(order: DemoOrder): PlacedOrder {
  return {
    orderNumber: order.orderNumber,
    accessToken: order.accessToken,
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalMinor: order.totalMinor,
    nextAction:
      order.paymentMethod === "mpesa_stk"
        ? "mpesa_stk"
        : order.paymentMethod === "mpesa_paybill"
          ? "paybill_instructions"
          : "await_confirmation",
    trackingPath: `/orders/${order.orderNumber}?token=${encodeURIComponent(order.accessToken)}`,
  };
}

function toSummary(order: DemoOrder): OrderSummary {
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    fulfilmentMethod: order.fulfilmentMethod,
    totalMinor: order.totalMinor,
    placedAt: order.placedAt,
    itemCount: order.items.length,
    previewNames: order.items.slice(0, 3).map((item) => item.productName),
  };
}

export function createMockOrderService(): OrderService {
  return {
    async quoteCart(input) {
      const scenarios = await mockRequest();
      return computeQuote(input, storefrontProducts(scenarios), scenarios);
    },

    async placeOrder(input) {
      const scenarios = await mockRequest();

      const replay = readState().orders.find((o) => o.idempotencyKey === input.idempotencyKey);
      if (replay) return placedResponse(replay); // NFR-REL-1: same key, same order

      const { phone } = validateInput(input);
      const fulfilment = input.fulfilment;
      const quote = computeQuote(
        {
          items: input.items,
          fulfilment: fulfilment.method,
          deliveryAreaId: fulfilment.method === "delivery" ? fulfilment.deliveryAreaId : null,
          pickupLocationId: fulfilment.method === "collection" ? fulfilment.pickupLocationId : null,
          promoCode: input.promoCode ?? null,
        },
        storefrontProducts(scenarios),
        scenarios,
      );

      const lineIssues = quote.lines.flatMap((line) => line.issues);
      if (lineIssues.some((i) => i.code === "INSUFFICIENT_STOCK" || i.code === "UNAVAILABLE")) {
        throw new AppError("INSUFFICIENT_STOCK", undefined, { quote });
      }
      if (lineIssues.some((i) => i.code === "QUANTITY_RULE")) {
        throw new AppError("QUANTITY_RULE", undefined, { quote });
      }
      if (lineIssues.some((i) => i.code === "COLLECTION_ONLY")) {
        throw new AppError(
          "VALIDATION_FAILED",
          "Some items are pick-up only. Choose pick-up, or remove them from your order.",
          { fields: { "fulfilment.method": "Some items are pick-up only." }, quote },
        );
      }
      for (const issue of quote.issues) {
        if (issue.code === "AREA_NOT_SERVED")
          throw new AppError("AREA_NOT_SERVED", undefined, { quote });
        if (issue.code === "BELOW_MINIMUM_ORDER") {
          throw new AppError(
            "BELOW_MINIMUM_ORDER",
            `Delivery to this area needs a minimum order of ${formatKES(issue.minimumMinor)}.`,
            { quote },
          );
        }
        if (issue.code === "PROMO_INVALID") {
          throw new AppError("PROMO_INVALID", issue.reason, { quote });
        }
      }
      if (
        !isPaymentMethodAllowed(
          siteSettings.payments,
          input.paymentMethod,
          fulfilment.method,
          quote.totalMinor,
        )
      ) {
        throw new AppError("PAYMENT_METHOD_UNAVAILABLE", undefined, { quote });
      }
      if (quote.totalMinor !== input.expectedTotalMinor) {
        throw new AppError("PRICE_CHANGED", undefined, { quote }); // BR-03
      }

      return mutateState((state) => {
        settleOrders(state);
        const openUnpaid = state.orders.filter(
          (o) =>
            o.customer.phone === phone &&
            o.status === "pending" &&
            (o.paymentStatus === "unpaid" || o.paymentStatus === "pending"),
        ).length;
        if (openUnpaid >= MAX_OPEN_UNPAID_PER_PHONE) throw new AppError("TOO_MANY_OPEN_ORDERS");

        const now = new Date();
        const area =
          fulfilment.method === "delivery" ? findDeliveryArea(fulfilment.deliveryAreaId) : null;
        const holdMinutes = siteSettings.orders.unpaidHoldMinutes;
        const order: DemoOrder = {
          orderNumber: `PH${String(state.nextOrderSeq).padStart(6, "0")}`,
          accessToken: randomId(),
          idempotencyKey: input.idempotencyKey,
          customerId: state.sessionUserId,
          customer: {
            name: input.customer.name.trim(),
            phone,
            email: blankToNull(input.customer.email),
          },
          status: "pending",
          paymentStatus: "unpaid",
          paymentMethod: input.paymentMethod,
          fulfilmentMethod: fulfilment.method,
          items: quote.lines.map((line) => ({
            variantId: line.variantId,
            productSlug: line.productSlug,
            productName: line.productName,
            variantName: line.variantName,
            unit: line.unit,
            unitPriceMinor: line.unitPriceMinor,
            quantity: line.quantity,
            lineTotalMinor: line.lineTotalMinor,
            image: line.image,
          })),
          subtotalMinor: quote.subtotalMinor,
          discountMinor: quote.discountMinor,
          deliveryFeeMinor: quote.deliveryFeeMinor ?? 0,
          totalMinor: quote.totalMinor,
          promoCode: quote.promo?.code ?? null,
          delivery:
            fulfilment.method === "delivery" && area
              ? {
                  areaId: area.area.id,
                  county: area.area.county,
                  town: fulfilment.town.trim(),
                  addressLine: fulfilment.addressLine.trim(),
                  directions: blankToNull(fulfilment.directions),
                  instructions: blankToNull(fulfilment.instructions),
                  zoneName: area.zone.name,
                  etaMinDays: area.zone.etaMinDays,
                  etaMaxDays: area.zone.etaMaxDays,
                }
              : null,
          pickupLocationId: fulfilment.method === "collection" ? fulfilment.pickupLocationId : null,
          note: blankToNull(input.note),
          placedAt: now.toISOString(),
          reservedUntil:
            input.paymentMethod === "mpesa_stk"
              ? new Date(now.getTime() + holdMinutes * 60_000).toISOString()
              : null,
          events: [event("placed", "Order placed")],
          payments: [],
          needsReview: false,
          reservesStock: true,
        };
        state.nextOrderSeq += 1;
        state.orders.push(order);
        return placedResponse(order);
      });
    },

    async getOrder(ref) {
      await mockRequest();
      return mutateState((state) => {
        settleOrders(state);
        const order = findAccessibleOrder(state, ref);
        return order ? toOrderDetail(order, ref) : null;
      });
    },

    async trackOrder({ orderNumber, phone }): Promise<OrderTracking | null> {
      await mockRequest();
      const normalized = normalizeKenyanMobile(phone);
      return mutateState((state) => {
        settleOrders(state);
        const order = state.orders.find(
          (o) =>
            o.orderNumber === orderNumber.trim().toUpperCase() && o.customer.phone === normalized,
        );
        if (!order) return null;
        return {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          fulfilmentMethod: order.fulfilmentMethod,
          events: order.events.map(({ label, at }) => ({ label, at })),
        };
      });
    },

    async listMyOrders(page = {}) {
      const scenarios = await mockRequest();
      const { page: pageNumber = 1, pageSize = 10 } = page;
      return mutateState((state) => {
        settleOrders(state);
        const userId = currentUserId(state);
        if (userId === null) throw new AppError("UNAUTHENTICATED");
        const mine = scenarios.has("empty")
          ? []
          : state.orders
              .filter((order) => order.customerId === userId)
              .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
        const start = (pageNumber - 1) * pageSize;
        return {
          items: mine.slice(start, start + pageSize).map(toSummary),
          total: mine.length,
          page: pageNumber,
          pageSize,
        };
      });
    },

    async cancelPendingOrder(ref) {
      await mockRequest();
      mutateState((state) => {
        settleOrders(state);
        const order = findAccessibleOrder(state, ref);
        if (!order) throw new AppError("NOT_FOUND");
        if (order.status !== "pending") throw new AppError("NOT_CANCELLABLE"); // BR-25
        order.status = "cancelled";
        for (const payment of order.payments) {
          if (payment.status === "pending") payment.status = "cancelled";
        }
        if (order.paymentStatus === "pending") order.paymentStatus = "unpaid";
        order.events.push(
          event("status_changed", orderStatusLabel(order).label, "You cancelled this order."),
        );
      });
    },
  };
}
