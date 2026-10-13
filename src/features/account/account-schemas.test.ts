import { describe, expect, it } from "vitest";

import { newPasswordSchema, signUpSchema } from "../auth/auth-schemas";

import { addressSchema, profileSchema } from "./account-schemas";

const paths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.success ? [] : (result.error?.issues.map((issue) => issue.path.join(".")) ?? []);

describe("account forms (ACC-01, ACC-04, ACC-05)", () => {
  it("lets a profile clear its phone, but not save a bad one", () => {
    expect(
      paths(profileSchema.safeParse({ fullName: "Jane", phone: "", marketingOptIn: false })),
    ).toEqual([]);
    expect(
      paths(profileSchema.safeParse({ fullName: "Jane", phone: "0812", marketingOptIn: true })),
    ).toEqual(["phone"]);
  });

  it("needs an address's name, recipient, phone, county, town and street", () => {
    const valid = {
      label: "Home",
      recipientName: "Jane Wanjiru",
      phone: "0712 345 678",
      county: "Kiambu",
      deliveryAreaId: "",
      town: "Ruiru",
      addressLine: "Greenfield Estate, House 14",
      directions: "",
      isDefault: false,
    };
    expect(paths(addressSchema.safeParse(valid))).toEqual([]);
    expect(
      paths(
        addressSchema.safeParse({
          ...valid,
          label: " ",
          county: "Atlantis",
          addressLine: "1",
          phone: "",
        }),
      ).sort(),
    ).toEqual(["addressLine", "county", "label", "phone"]);
  });

  it("checks sign-up passwords for length and new passwords for a match", () => {
    expect(
      paths(
        signUpSchema.safeParse({
          fullName: "Jane",
          email: "jane@example.com",
          phone: "0712345678",
          password: "short",
          marketingOptIn: false,
        }),
      ),
    ).toEqual(["password"]);
    expect(
      paths(newPasswordSchema.safeParse({ password: "longenough", confirm: "longenougH" })),
    ).toEqual(["confirm"]);
    expect(
      paths(newPasswordSchema.safeParse({ password: "longenough", confirm: "longenough" })),
    ).toEqual([]);
  });
});
