import { z } from "zod/mini";

import { isEmail } from "@/domain/email";
import { normalizeKenyanMobile } from "@/domain/phone";
import { errorCopy } from "@/lib/errors";

// Auth forms (ACC-01 to ACC-03). The data source enforces the same rules (NFR-SEC-4); these only
// give quick, specific feedback.

export const MIN_PASSWORD_LENGTH = 8;

const email = z.string().check(
  z.trim(),
  z.refine((value) => isEmail(value), "Enter a valid email address."),
);

const newPassword = z
  .string()
  .check(
    z.minLength(MIN_PASSWORD_LENGTH, `Use at least ${MIN_PASSWORD_LENGTH} characters.`),
    z.maxLength(72, "Use at most 72 characters."),
  );

export const signInSchema = z.object({
  email,
  password: z.string().check(z.minLength(1, "Enter your password.")),
});

export const signUpSchema = z.object({
  fullName: z.string().check(z.trim(), z.minLength(2, "Enter your name.")),
  email,
  phone: z
    .string()
    .check(z.refine((value) => normalizeKenyanMobile(value) !== null, errorCopy("INVALID_PHONE"))),
  password: newPassword,
  marketingOptIn: z.boolean(),
});

export const emailOnlySchema = z.object({ email });

export const newPasswordSchema = z.object({ password: newPassword, confirm: z.string() }).check(
  z.superRefine((values, ctx) => {
    if (values.confirm !== values.password) {
      ctx.addIssue({ code: "custom", path: ["confirm"], message: "The passwords don't match." });
    }
  }),
);

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type EmailOnlyValues = z.infer<typeof emailOnlySchema>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
