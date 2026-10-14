import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";

import { MIN_PASSWORD_LENGTH, newPasswordSchema, type NewPasswordValues } from "../auth-schemas";
import { useSession } from "../session";

import { AuthShell, FormAlert } from "./auth-shell";
import { PasswordField } from "./password-field";

/** Choose a new password (ACC-03), reached from the emailed link, which signs the customer in. */
export function ResetPasswordPage() {
  const navigate = useNavigate();
  const session = useSession();
  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });
  const update = useMutation({
    mutationFn: ({ password }: NewPasswordValues) => getServices().auth.updatePassword(password),
    onSuccess: async () => {
      notifySuccess("Your password has been changed");
      await navigate("/account", { replace: true });
    },
  });

  if (session.status === "loading") {
    return (
      <AuthShell title="Choose a new password">
        <Skeleton className="h-40 w-full" />
      </AuthShell>
    );
  }

  if (!session.session) {
    return (
      <AuthShell title="Choose a new password">
        <p className="text-ink-700">
          Open the link from your password reset email first. It signs you in so you can choose a
          new password.
        </p>
        <Link to="/auth/forgot-password" className={buttonVariants({ className: "w-fit" })}>
          Get a reset link
        </Link>
      </AuthShell>
    );
  }

  const errors = form.formState.errors;
  return (
    <AuthShell title="Choose a new password" description={`For ${session.session.user.email}.`}>
      {update.isError ? <FormAlert>{errorMessage(update.error)}</FormAlert> : null}
      <form
        noValidate
        onSubmit={form.handleSubmit((values) => update.mutate(values))}
        className="flex flex-col gap-5"
        aria-label="Choose a new password"
      >
        <PasswordField
          {...form.register("password")}
          label="New password"
          hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          autoComplete="new-password"
          error={errors.password?.message}
        />
        <PasswordField
          {...form.register("confirm")}
          label="Type it again"
          autoComplete="new-password"
          error={errors.confirm?.message}
        />
        <Button type="submit" size="lg" loading={update.isPending} className="w-full">
          Save new password
        </Button>
      </form>
    </AuthShell>
  );
}
