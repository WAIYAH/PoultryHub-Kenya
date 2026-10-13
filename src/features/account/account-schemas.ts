import { z } from "zod/mini";

import { isCountyName } from "@/domain/counties";
import { normalizeKenyanMobile } from "@/domain/phone";
import { errorCopy } from "@/lib/errors";

// Profile and address forms (ACC-04, ACC-05). The data source repeats every check.

const kenyanMobile = z
  .string()
  .check(z.refine((value) => normalizeKenyanMobile(value) !== null, errorCopy("INVALID_PHONE")));

export const profileSchema = z.object({
  fullName: z.string().check(z.trim(), z.minLength(2, "Enter your name.")),
  phone: z
    .string()
    .check(
      z.refine(
        (value) => value.trim() === "" || normalizeKenyanMobile(value) !== null,
        errorCopy("INVALID_PHONE"),
      ),
    ),
  marketingOptIn: z.boolean(),
});

export const addressSchema = z.object({
  label: z.string().check(z.trim(), z.minLength(1, "Give the address a name, e.g. Home.")),
  recipientName: z.string().check(z.trim(), z.minLength(2, "Enter the recipient's name.")),
  phone: kenyanMobile,
  county: z.string().check(z.refine((value) => isCountyName(value), "Choose a county.")),
  deliveryAreaId: z.string(),
  town: z.string().check(z.trim(), z.minLength(2, "Enter the town or neighbourhood.")),
  addressLine: z.string().check(z.trim(), z.minLength(5, "Enter the estate, street or building.")),
  directions: z.string().check(z.trim(), z.maxLength(500, "Keep this under 500 characters.")),
  isDefault: z.boolean(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
