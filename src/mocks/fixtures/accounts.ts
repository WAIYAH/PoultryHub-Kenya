// SAMPLE DATA: one demo customer account and a few example orders, so the account, order and
// tracking pages have something to show. The demo password is public on purpose: the mock data
// source is refused in production builds (src/lib/env.ts), and Phase 3 test users get passwords
// from local environment variables instead.
import type {
  Address,
  FulfilmentMethod,
  MinorUnits,
  OrderDetail,
  OrderEvent,
  OrderItem,
  OrderPayment,
  OrderPaymentStatus,
  OrderStatus,
  PaymentMethod,
} from "@/types/domain";

import { daysAgo } from "./dates";

export interface FixtureUser {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  marketingOptIn: boolean;
  confirmed: boolean;
  addresses: Address[];
}

export interface FixturePayment extends OrderPayment {
  id: string;
}

/** The mock data source's order record (mirrors the `orders` table plus its children). */
export interface FixtureOrder {
  orderNumber: string;
  accessToken: string;
  idempotencyKey: string | null;
  customerId: string | null;
  customer: { name: string; phone: string; email: string | null };
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  paymentMethod: PaymentMethod;
  fulfilmentMethod: FulfilmentMethod;
  items: (OrderItem & { variantId: string })[];
  subtotalMinor: MinorUnits;
  discountMinor: MinorUnits;
  deliveryFeeMinor: MinorUnits;
  totalMinor: MinorUnits;
  promoCode: string | null;
  delivery: (NonNullable<OrderDetail["delivery"]> & { areaId: string }) | null;
  pickupLocationId: string | null;
  note: string | null;
  placedAt: string;
  reservedUntil: string | null;
  events: OrderEvent[];
  payments: FixturePayment[];
  /** BR-21: a payment arrived for a cancelled order and an admin must decide what to do. */
  needsReview: boolean;
}

export const DEMO_ACCOUNT = { email: "demo@poultryhub.example", password: "demo1234" } as const;

export const users: FixtureUser[] = [
  {
    id: "usr-demo",
    email: DEMO_ACCOUNT.email,
    password: DEMO_ACCOUNT.password,
    fullName: "Wanjiru Demo",
    phone: "+254700000001",
    marketingOptIn: false,
    confirmed: true,
    addresses: [
      {
        id: "adr-demo-home",
        label: "Home",
        recipientName: "Wanjiru Demo",
        phone: "+254700000001",
        county: "Kiambu",
        deliveryAreaId: "area-ruiru",
        town: "Ruiru",
        addressLine: "Sample: Kamakis, Greenfield Estate, House 14",
        directions: "Sample: gate opposite the petrol station",
        isDefault: true,
      },
      {
        id: "adr-demo-shop",
        label: "Shop",
        recipientName: "Wanjiru Demo",
        phone: "+254700000002",
        county: "Nairobi",
        deliveryAreaId: "area-kasarani",
        town: "Kasarani",
        addressLine: "Sample: Mwiki Road, Shop 3",
        directions: null,
        isDefault: false,
      },
    ],
  },
];

const eggsLarge = (quantity: number) => ({
  variantId: "var-eggs-tray-large",
  productSlug: "farm-fresh-eggs",
  productName: "Farm fresh eggs",
  variantName: "Tray of 30 (large)",
  unit: "tray" as const,
  unitPriceMinor: 55_000,
  quantity,
  lineTotalMinor: 55_000 * quantity,
  image: null,
});

export function exampleOrders(): FixtureOrder[] {
  const deliveredAt = daysAgo(20);
  const placedEarly = daysAgo(21, 4);
  const placedRecent = daysAgo(2, 5);
  const placedGuest = daysAgo(1, 3);

  return [
    {
      orderNumber: "PH001001",
      accessToken: "sample-token-PH001001",
      idempotencyKey: null,
      customerId: "usr-demo",
      customer: { name: "Wanjiru Demo", phone: "+254700000001", email: DEMO_ACCOUNT.email },
      status: "completed",
      paymentStatus: "paid",
      paymentMethod: "mpesa_stk",
      fulfilmentMethod: "delivery",
      items: [
        eggsLarge(2),
        {
          variantId: "var-layers-70",
          productSlug: "layers-mash",
          productName: "Layers mash",
          variantName: "70 kg bag",
          unit: "bag",
          unitPriceMinor: 420_000,
          quantity: 1,
          lineTotalMinor: 420_000,
          image: null,
        },
      ],
      subtotalMinor: 530_000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      totalMinor: 530_000,
      promoCode: null,
      delivery: {
        areaId: "area-ruiru",
        county: "Kiambu",
        town: "Ruiru",
        addressLine: "Sample: Kamakis, Greenfield Estate, House 14",
        directions: "Sample: gate opposite the petrol station",
        instructions: "Call on arrival",
        zoneName: "Thika Road corridor",
        etaMinDays: 1,
        etaMaxDays: 2,
      },
      pickupLocationId: null,
      note: null,
      placedAt: placedEarly,
      reservedUntil: null,
      events: [
        { type: "placed", label: "Order placed", at: placedEarly },
        { type: "payment_succeeded", label: "Payment received: M-Pesa SAMPLE123", at: placedEarly },
        { type: "status_changed", label: "Payment confirmed", at: placedEarly },
        { type: "status_changed", label: "Being prepared", at: daysAgo(21, 1) },
        {
          type: "status_changed",
          label: "Out for delivery",
          message: "Rider: Sample Rider",
          at: daysAgo(20, 3),
        },
        { type: "status_changed", label: "Delivered", at: deliveredAt },
      ],
      payments: [
        {
          id: "pay-sample-1001",
          status: "succeeded",
          method: "mpesa_stk",
          amountMinor: 530_000,
          phone: "+254700000001",
          receipt: "SAMPLE123",
          resultMessage: "Payment received. Thank you!",
          at: placedEarly,
        },
      ],
      needsReview: false,
    },
    {
      orderNumber: "PH001002",
      accessToken: "sample-token-PH001002",
      idempotencyKey: null,
      customerId: "usr-demo",
      customer: { name: "Wanjiru Demo", phone: "+254700000001", email: DEMO_ACCOUNT.email },
      status: "processing",
      paymentStatus: "unpaid",
      paymentMethod: "pay_on_collection",
      fulfilmentMethod: "collection",
      items: [
        {
          variantId: "var-chicks-layer",
          productSlug: "layer-chicks",
          productName: "Layer day-old chicks",
          variantName: "Per chick",
          unit: "chick",
          unitPriceMinor: 15_000,
          quantity: 100,
          lineTotalMinor: 1_500_000,
          image: null,
        },
      ],
      subtotalMinor: 1_500_000,
      discountMinor: 0,
      deliveryFeeMinor: 0,
      totalMinor: 1_500_000,
      promoCode: null,
      delivery: null,
      pickupLocationId: "pickup-farm",
      note: "Sample note: I'll bring two chick boxes.",
      placedAt: placedRecent,
      reservedUntil: null,
      events: [
        { type: "placed", label: "Order placed", at: placedRecent },
        { type: "status_changed", label: "Order confirmed", at: daysAgo(2, 3) },
        { type: "status_changed", label: "Being prepared", at: daysAgo(1, 8) },
      ],
      payments: [],
      needsReview: false,
    },
    {
      orderNumber: "PH001003",
      accessToken: "sample-token-PH001003",
      idempotencyKey: null,
      customerId: null,
      customer: { name: "Guest Demo", phone: "+254700000003", email: null },
      status: "dispatched",
      paymentStatus: "unpaid",
      paymentMethod: "pay_on_delivery",
      fulfilmentMethod: "delivery",
      items: [eggsLarge(3)],
      subtotalMinor: 165_000,
      discountMinor: 0,
      deliveryFeeMinor: 35_000,
      totalMinor: 200_000,
      promoCode: null,
      delivery: {
        areaId: "area-kilimani",
        county: "Nairobi",
        town: "Kilimani",
        addressLine: "Sample: Argwings Kodhek Road, Apartment 5B",
        directions: null,
        instructions: null,
        zoneName: "Nairobi",
        etaMinDays: 1,
        etaMaxDays: 3,
      },
      pickupLocationId: null,
      note: null,
      placedAt: placedGuest,
      reservedUntil: null,
      events: [
        { type: "placed", label: "Order placed", at: placedGuest },
        { type: "status_changed", label: "Order confirmed", at: daysAgo(1, 1) },
        { type: "status_changed", label: "Being prepared", at: daysAgo(0, 6) },
        {
          type: "status_changed",
          label: "Out for delivery",
          message: "Rider: Sample Rider",
          at: daysAgo(0, 2),
        },
      ],
      payments: [],
      needsReview: false,
    },
  ];
}
