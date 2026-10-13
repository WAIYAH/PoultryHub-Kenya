import { describe, expect, it } from "vitest";

import {
  formatKenyanMobile,
  isKenyanMobile,
  maskPhone,
  normalizeKenyanMobile,
  toMpesaMsisdn,
} from "./phone";

describe("normalizeKenyanMobile (KM-2)", () => {
  it.each([
    ["0712 345 678", "+254712345678"],
    ["0712345678", "+254712345678"],
    ["0112345678", "+254112345678"],
    ["+254 712-345-678", "+254712345678"],
    ["254712345678", "+254712345678"],
    ["712345678", "+254712345678"],
    ["(0712) 345.678", "+254712345678"],
  ])("normalises %j", (input, expected) => {
    expect(normalizeKenyanMobile(input)).toBe(expected);
  });

  it.each([
    ["Nairobi landline", "020 123 4567"],
    ["too short", "071234567"],
    ["too long", "07123456789"],
    ["letters", "07I2345678"],
    ["foreign number", "+447700900123"],
    ["empty", ""],
  ])("rejects %s", (_label, input) => {
    expect(normalizeKenyanMobile(input)).toBeNull();
    expect(isKenyanMobile(input)).toBe(false);
  });
});

describe("phone formatting", () => {
  it("formats for display", () => {
    expect(formatKenyanMobile("+254712345678")).toBe("0712 345 678");
  });
  it("converts to M-Pesa MSISDN", () => {
    expect(toMpesaMsisdn("+254712345678")).toBe("254712345678");
  });
  it("masks for logs (NFR-PRIV-4)", () => {
    expect(maskPhone("+254712345678")).toBe("2547****678");
  });
});
