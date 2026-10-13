import { z } from "zod/mini";

import { isEmail } from "@/domain/email";
import { normalizeKenyanMobile } from "@/domain/phone";
import type {
  Address,
  CartItemInput,
  FulfilmentMethod,
  MinorUnits,
  PaymentMethod,
  PlaceOrderInput,
} from "@/types/domain";

// The checkout form (CHK-01 to CHK-04): one flat set of string fields, so React Hook Form and the
// session draft stay simple. Delivery and pick-up fields are checked only for the chosen method.
// The server repeats every check (BR-03); in Phase 4 this schema moves to the shared contracts.

export interface CheckoutValues {
  name: string;
  phone: string;
  email: string;
  fulfilment: FulfilmentMethod;
  county: string;
  deliveryAreaId: string;
  town: string;
  addressLine: string;
  directions: string;
  instructions: string;
  pickupLocationId: string;
  paymentMethod: PaymentMethod | "";
  note: string;
}

export type CheckoutField = keyof CheckoutValues;

export const EMPTY_CHECKOUT: CheckoutValues = {
  name: "",
  phone: "",
  email: "",
  fulfilment: "delivery",
  county: "",
  deliveryAreaId: "",
  town: "",
  addressLine: "",
  directions: "",
  instructions: "",
  pickupLocationId: "",
  paymentMethod: "",
  note: "",
};

/** Field names as the error summary reads them ("Please fix 2 fields: Phone number, Area"). */
export const FIELD_LABELS: Record<CheckoutField, string> = {
  name: "Full name",
  phone: "Phone number",
  email: "Email",
  fulfilment: "Delivery or pick-up",
  county: "County",
  deliveryAreaId: "Area",
  town: "Town or neighbourhood",
  addressLine: "Estate, street or building",
  directions: "Landmark and directions",
  instructions: "Delivery instructions",
  pickupLocationId: "Pick-up point",
  paymentMethod: "Payment method",
  note: "Order note",
};

/** The element id of a field, so the error summary can link to it. */
export function fieldId(field: CheckoutField): string {
  return `checkout-${field}`;
}

const text = (max: number) =>
  z.string().check(z.trim(), z.maxLength(max, `Keep this under ${max} characters.`));

export const checkoutSchema = z
  .object({
    name: z
      .string()
      .check(
        z.trim(),
        z.minLength(2, "Enter your name."),
        z.maxLength(100, "Keep your name under 100 characters."),
      ),
    phone: z
      .string()
      .check(
        z.refine(
          (value) => normalizeKenyanMobile(value) !== null,
          "Enter a Kenyan mobile number, e.g. 0712 345 678.",
        ),
      ),
    email: z.string().check(
      z.trim(),
      z.refine(
        (value) => value === "" || isEmail(value),
        "Enter a valid email address, or leave it blank.",
      ),
    ),
    fulfilment: z.enum(["delivery", "collection"]),
    county: z.string(),
    deliveryAreaId: z.string(),
    town: text(80),
    addressLine: text(200),
    directions: text(500),
    instructions: text(300),
    pickupLocationId: z.string(),
    paymentMethod: z.enum([
      "",
      "mpesa_stk",
      "mpesa_paybill",
      "pay_on_delivery",
      "pay_on_collection",
    ]),
    note: text(500),
  })
  .check(
    // Runs even when other fields failed, so the error summary lists every problem at once.
    z.superRefine(
      (values, ctx) => {
        const issue = (path: CheckoutField, message: string) =>
          ctx.addIssue({ code: "custom", path: [path], message });
        if (values.fulfilment === "delivery") {
          if (!values.county) issue("county", "Choose your county.");
          if (!values.deliveryAreaId) issue("deliveryAreaId", "Choose your area.");
          if (values.town.trim().length < 2) issue("town", "Enter your town or neighbourhood.");
          if (values.addressLine.trim().length < 5) {
            issue("addressLine", "Enter your estate, street or building.");
          }
        } else if (!values.pickupLocationId) {
          issue("pickupLocationId", "Choose a pick-up point.");
        }
        if (!values.paymentMethod) issue("paymentMethod", "Choose how you'll pay.");
      },
      { when: ({ value }) => typeof value === "object" && value !== null },
    ),
  );

const blank = (value: string) => (value.trim() === "" ? null : value.trim());

/** The order request for the server, which re-validates and re-prices everything (BR-03). */
export function toPlaceOrderInput(
  values: CheckoutValues,
  options: {
    items: CartItemInput[];
    promoCode: string | null;
    expectedTotalMinor: MinorUnits;
    idempotencyKey: string;
  },
): PlaceOrderInput {
  if (!values.paymentMethod) throw new Error("A payment method is required.");
  return {
    idempotencyKey: options.idempotencyKey,
    customer: {
      name: values.name.trim(),
      phone: normalizeKenyanMobile(values.phone) ?? values.phone,
      email: blank(values.email),
    },
    items: options.items,
    fulfilment:
      values.fulfilment === "delivery"
        ? {
            method: "delivery",
            deliveryAreaId: values.deliveryAreaId,
            town: values.town.trim(),
            addressLine: values.addressLine.trim(),
            directions: blank(values.directions),
            instructions: blank(values.instructions),
          }
        : { method: "collection", pickupLocationId: values.pickupLocationId },
    paymentMethod: values.paymentMethod,
    promoCode: options.promoCode,
    note: blank(values.note),
    expectedTotalMinor: options.expectedTotalMinor,
  };
}

const SERVER_FIELDS: Record<string, CheckoutField> = {
  "customer.name": "name",
  "customer.phone": "phone",
  "customer.email": "email",
  "fulfilment.method": "fulfilment",
  "fulfilment.deliveryAreaId": "deliveryAreaId",
  "fulfilment.town": "town",
  "fulfilment.addressLine": "addressLine",
  "fulfilment.pickupLocationId": "pickupLocationId",
  paymentMethod: "paymentMethod",
  note: "note",
};

/** Maps the server's VALIDATION_FAILED field paths onto form fields; unknown paths are dropped. */
export function serverFieldErrors(fields: unknown): Partial<Record<CheckoutField, string>> {
  if (typeof fields !== "object" || fields === null) return {};
  const result: Partial<Record<CheckoutField, string>> = {};
  for (const [path, message] of Object.entries(fields)) {
    const field = SERVER_FIELDS[path];
    if (field && typeof message === "string") result[field] = message;
  }
  return result;
}

/** The delivery fields a saved address fills in (CHK-01). */
export function addressFields(
  address: Pick<Address, "county" | "deliveryAreaId" | "town" | "addressLine" | "directions">,
): Pick<CheckoutValues, "county" | "deliveryAreaId" | "town" | "addressLine" | "directions"> {
  return {
    county: address.county,
    deliveryAreaId: address.deliveryAreaId ?? "",
    town: address.town,
    addressLine: address.addressLine,
    directions: address.directions ?? "",
  };
}
