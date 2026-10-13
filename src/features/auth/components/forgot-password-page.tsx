import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { TextField } from "@/components/shared/form-field";
import { Button, buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { getServices } from "@/services";

import { emailOnlySchema, type EmailOnlyValues } from "../auth-schemas";

import { AuthShell, FormAlert } from "./auth-shell";

/**
 * Request a password reset link (ACC-03). The answer is the same whether or not an account
 * exists, so the form can't be used to find out who has one.
 */
export function ForgotPasswordPage() {
  const form = useForm<EmailOnlyValues>({
    resolver: zodResolver(emailOnlySchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });
  const request = useMutation({
    mutationFn: ({ email }: EmailOnlyValues) => getServices().auth.requestPasswordReset(email),
  });

  if (request.isSuccess) {
    return (
      <AuthShell title="Check your email">
        <div className="flex flex-col items-center gap-3 text-center" role="status">
          <MailCheck aria-hidden="true" className="size-10 text-forest-700" />
          <p className="text-ink-700">
            If there's an account for <strong className="text-ink-900">{request.data.email}</strong>
            , we've sent it a link to choose a new password. The link works for one hour.
          </p>
        </div>
        {request.data.demoLink ? (
          <div className="flex flex-col gap-2 rounded-md bg-gold-100 p-3 text-sm text-ink-700">
            <p>Demo: no email is sent. Open the link it would contain:</p>
            <Link
              to={request.data.demoLink}
              className={buttonVariants({ size: "sm", className: "w-fit" })}
            >
              Open the reset link
            </Link>
          </div>
        ) : null}
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to choose a new one."
      footer={
        <Link
          to="/auth/sign-in"
          className="font-semibold text-forest-700 underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      {request.isError ? <FormAlert>{errorMessage(request.error)}</FormAlert> : null}
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => request.mutate(values))}
        className="flex flex-col gap-5"
        aria-label="Request a password reset link"
      >
        <TextField
          {...form.register("email")}
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          error={form.formState.errors.email?.message}
        />
        <Button type="submit" size="lg" loading={request.isPending} className="w-full">
          Send the link
        </Button>
      </form>
    </AuthShell>
  );
}
