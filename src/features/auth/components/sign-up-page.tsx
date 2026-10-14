import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";

import { TextField } from "@/components/shared/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { errorMessage, isAppError } from "@/lib/errors";
import { getServices } from "@/services";

import { MIN_PASSWORD_LENGTH, signUpSchema, type SignUpValues } from "../auth-schemas";
import { safeNextPath } from "../safe-next";

import { AuthShell, FormAlert } from "./auth-shell";
import { PasswordField } from "./password-field";

const SIGN_UP_FIELDS = ["fullName", "email", "phone", "password"] as const;

/**
 * Create an account (ACC-01): name, email, phone and password, then a confirmation link by email.
 * Marketing messages are opt-in and off by default. Turnstile arrives with the real backend.
 */
export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", marketingOptIn: false },
    mode: "onTouched",
  });
  const {
    register,
    setError,
    formState: { errors },
  } = form;

  const signUp = useMutation({
    mutationFn: (values: SignUpValues) => getServices().auth.signUp(values),
    onError: (error) => {
      if (isAppError(error, "EMAIL_IN_USE")) {
        setError("email", { type: "server", message: error.message }, { shouldFocus: true });
        return;
      }
      const fields = isAppError(error, "VALIDATION_FAILED") ? error.details?.fields : undefined;
      if (typeof fields === "object" && fields !== null) {
        for (const field of SIGN_UP_FIELDS) {
          const message = (fields as Record<string, unknown>)[field];
          if (typeof message === "string") setError(field, { type: "server", message });
        }
      }
    },
  });

  if (signUp.isSuccess) {
    // The demo link comes back with the final destination; keep the customer's `next`.
    const demoLink = signUp.data.demoLink?.replace(
      /next=[^&]*/,
      `next=${encodeURIComponent(next)}`,
    );
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center" role="status">
          <MailCheck aria-hidden="true" className="size-10 text-forest-700" />
          <p className="text-ink-700">
            We've sent a confirmation link to{" "}
            <strong className="text-ink-900">{signUp.data.email}</strong>. Open it to finish
            creating your account.
          </p>
          <p className="text-sm text-ink-600">
            No email after a few minutes? Check your spam folder.
          </p>
        </div>
        {demoLink ? (
          <div className="flex flex-col gap-2 rounded-md bg-gold-100 p-3 text-sm text-ink-700">
            <p>Demo: no email is sent. Open the link it would contain:</p>
            <Link to={demoLink} className={buttonVariants({ size: "sm", className: "w-fit" })}>
              Open the confirmation link
            </Link>
          </div>
        ) : null}
      </AuthShell>
    );
  }

  const unexpected =
    signUp.isError &&
    !isAppError(signUp.error, "EMAIL_IN_USE") &&
    !isAppError(signUp.error, "VALIDATION_FAILED");

  return (
    <AuthShell
      title="Create an account"
      description="Save your details and addresses, and see all your orders in one place."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to={`/auth/sign-in${next === "/account" ? "" : `?next=${encodeURIComponent(next)}`}`}
            className="font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      {unexpected ? <FormAlert>{errorMessage(signUp.error)}</FormAlert> : null}
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => signUp.mutate(values))}
        className="flex flex-col gap-5"
        aria-label="Create an account"
      >
        <TextField
          {...register("fullName")}
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
        />
        <TextField
          {...register("email")}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email?.message}
        />
        <TextField
          {...register("phone")}
          label="Phone number"
          hint="For M-Pesa and order updates, e.g. 0712 345 678."
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          error={errors.phone?.message}
        />
        <PasswordField
          {...register("password")}
          label="Password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-700">
          <input
            type="checkbox"
            {...register("marketingOptIn")}
            className="mt-0.5 size-5 shrink-0 cursor-pointer accent-forest-700"
          />
          <span>Send me offers and farm news by SMS or email. You can stop them at any time.</span>
        </label>
        <Button type="submit" size="lg" loading={signUp.isPending} className="w-full">
          Create account
        </Button>
        <p className="text-xs text-ink-600">
          By creating an account you agree to our{" "}
          <Link to="/policies/terms" className="underline underline-offset-2">
            terms
          </Link>{" "}
          and{" "}
          <Link to="/policies/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </AuthShell>
  );
}
