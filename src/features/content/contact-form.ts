import { isEmail } from "@/domain/email";
import { normalizeOrderNumber } from "@/domain/order-status";
import { normalizeKenyanMobile } from "@/domain/phone";
import { errorCopy } from "@/lib/errors";
import type { ContactInput, ContactSubject } from "@/types/domain";

// The contact form (CNT-01). Plain functions rather than a form library: the contact page is
// pre-rendered and counts towards the JavaScript budget (NFR-PERF-3). The server repeats every
// check, and adds Turnstile in Phase 3.

export const CONTACT_SUBJECTS: { value: ContactSubject; label: string }[] = [
  { value: "general", label: "General question" },
  { value: "order_help", label: "Help with an order" },
  { value: "wholesale_quote", label: "Wholesale or bulk quote" },
  { value: "farm_visit", label: "Farm visit" },
  { value: "feedback", label: "Feedback" },
  { value: "other", label: "Something else" },
];

export interface ContactValues {
  name: string;
  phone: string;
  email: string;
  subject: ContactSubject;
  orderNumber: string;
  message: string;
}

export type ContactField = keyof ContactValues;

export const EMPTY_CONTACT: ContactValues = {
  name: "",
  phone: "",
  email: "",
  subject: "general",
  orderNumber: "",
  message: "",
};

export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 2_000;

export function isContactSubject(value: string | null): value is ContactSubject {
  return CONTACT_SUBJECTS.some((subject) => subject.value === value);
}

/** Field errors, in form order; empty when the message can be sent. */
export function validateContact(values: ContactValues): Partial<Record<ContactField, string>> {
  const errors: Partial<Record<ContactField, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Enter your name.";
  const phone = values.phone.trim();
  const email = values.email.trim();
  if (phone && !normalizeKenyanMobile(phone)) errors.phone = errorCopy("INVALID_PHONE");
  if (email && !isEmail(email)) errors.email = "Enter a valid email address.";
  if (!phone && !email) errors.phone = "Give a phone number or an email so we can reply.";
  if (values.orderNumber.trim() && !normalizeOrderNumber(values.orderNumber)) {
    errors.orderNumber = "Order numbers look like PH001234.";
  }
  const length = values.message.trim().length;
  if (length < MESSAGE_MIN) {
    errors.message = `Write at least ${MESSAGE_MIN} characters.`;
  } else if (length > MESSAGE_MAX) {
    errors.message = `Keep it under ${MESSAGE_MAX.toLocaleString("en-KE")} characters.`;
  }
  return errors;
}

export function toContactInput(values: ContactValues): ContactInput {
  return {
    name: values.name.trim(),
    phone: values.phone.trim() ? normalizeKenyanMobile(values.phone) : null,
    email: values.email.trim() || null,
    subject: values.subject,
    message: values.message.trim(),
    orderNumber: normalizeOrderNumber(values.orderNumber),
  };
}

/** "farm-fresh-eggs" → "farm fresh eggs", for a quote request that starts from a product page. */
export function productFromSlug(slug: string): string {
  return slug.replace(/[-_]+/g, " ").trim();
}
