import { describe, expect, it } from "vitest";

import { isEmail } from "./email";

describe("isEmail", () => {
  it("accepts ordinary addresses, ignoring surrounding spaces", () => {
    expect(isEmail("jane@example.com")).toBe(true);
    expect(isEmail(" jane.wanjiru+eggs@mail.co.ke ")).toBe(true);
  });

  it("rejects anything without a user, a domain and a dot", () => {
    for (const value of ["", "jane", "jane@example", "@example.com", "jane @example.com"]) {
      expect(isEmail(value)).toBe(false);
    }
  });
});
