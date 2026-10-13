import { describe, expect, it } from "vitest";

import { safeNextPath, signInPath } from "./safe-next";

describe("safeNextPath", () => {
  it("keeps paths on this site, with their query and hash", () => {
    expect(safeNextPath("/account/orders")).toBe("/account/orders");
    expect(safeNextPath("/checkout?step=2#payment")).toBe("/checkout?step=2#payment");
  });

  it("falls back for anything that could leave the site (open redirects)", () => {
    for (const next of [
      "https://evil.example/phish",
      "//evil.example",
      "/\\evil.example",
      "javascript:alert(1)",
      "account",
      "",
      null,
      undefined,
    ]) {
      expect(safeNextPath(next)).toBe("/account");
    }
  });

  it("never returns to an auth page, so sign-in can't loop", () => {
    expect(safeNextPath("/auth/sign-in?next=/auth/sign-in")).toBe("/account");
    expect(safeNextPath("/auth/callback", "/")).toBe("/");
  });

  it("builds the sign-in link for a page", () => {
    expect(signInPath("/account/orders?page=2")).toBe(
      "/auth/sign-in?next=%2Faccount%2Forders%3Fpage%3D2",
    );
  });
});
