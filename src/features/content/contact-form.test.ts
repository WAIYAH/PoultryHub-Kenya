import { describe, expect, it } from "vitest";

import {
  EMPTY_CONTACT,
  isContactSubject,
  productFromSlug,
  toContactInput,
  validateContact,
} from "./contact-form";

const valid = {
  ...EMPTY_CONTACT,
  name: "Jane Wanjiru",
  phone: "0712 345 678",
  message: "Do you deliver to Thika on Saturdays?",
};

describe("contact form (CNT-01)", () => {
  it("accepts a message with a phone or an email", () => {
    expect(validateContact(valid)).toEqual({});
    expect(validateContact({ ...valid, phone: "", email: "jane@example.com" })).toEqual({});
  });

  it("needs a way to reply", () => {
    expect(validateContact({ ...valid, phone: " ", email: "" })).toEqual({
      phone: "Give a phone number or an email so we can reply.",
    });
  });

  it("checks each field's format", () => {
    expect(
      Object.keys(
        validateContact({
          ...valid,
          name: "J",
          phone: "0812",
          email: "jane@",
          orderNumber: "12345",
          message: "Hi",
        }),
      ).sort(),
    ).toEqual(["email", "message", "name", "orderNumber", "phone"]);
    expect(validateContact({ ...valid, message: "x".repeat(2_001) })).toEqual({
      message: "Keep it under 2,000 characters.",
    });
  });

  it("sends normalised values", () => {
    expect(
      toContactInput({ ...valid, email: "  ", subject: "order_help", orderNumber: "ph 001234" }),
    ).toEqual({
      name: "Jane Wanjiru",
      phone: "+254712345678",
      email: null,
      subject: "order_help",
      message: "Do you deliver to Thika on Saturdays?",
      orderNumber: "PH001234",
    });
  });

  it("knows its subjects and reads product slugs", () => {
    expect(isContactSubject("wholesale_quote")).toBe(true);
    expect(isContactSubject("spam")).toBe(false);
    expect(isContactSubject(null)).toBe(false);
    expect(productFromSlug("farm-fresh-eggs")).toBe("farm fresh eggs");
  });
});
