import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  MIN_PASSWORD_LENGTH,
  PasswordField,
  newPasswordSchema,
  type NewPasswordValues,
} from "@/features/auth";
import { errorMessage } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";

import { SignOutButton } from "./sign-out-button";

/** Security (ACC-02, ACC-03, ACC-09): change password, sign out everywhere, delete the account. */
export function SecuritySettings() {
  const form = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });
  const errors = form.formState.errors;
  const change = useMutation({
    mutationFn: ({ password }: NewPasswordValues) => getServices().auth.updatePassword(password),
    onSuccess: () => {
      form.reset();
      notifySuccess("Your password has been changed");
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 text-ink-900">Security</h1>

      <section
        aria-labelledby="change-password"
        className="flex max-w-xl flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
      >
        <h2 id="change-password" className="text-h3 text-ink-900">
          Change password
        </h2>
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => change.mutate(values))}
          className="flex flex-col gap-5"
          aria-label="Change password"
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
          {change.isError ? (
            <p className="text-sm text-danger" role="alert">
              {errorMessage(change.error)}
            </p>
          ) : null}
          <Button type="submit" className="w-full sm:w-fit" loading={change.isPending}>
            Change password
          </Button>
        </form>
      </section>

      <section
        aria-labelledby="sessions"
        className="flex max-w-xl flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6"
      >
        <h2 id="sessions" className="text-h3 text-ink-900">
          Signed-in devices
        </h2>
        <p>
          Lost a phone, or signed in on someone else's? Sign out everywhere, then sign in again
          here.
        </p>
        <div className="flex flex-wrap gap-3">
          <SignOutButton />
          <SignOutButton scope="global" />
        </div>
      </section>

      <section
        aria-labelledby="delete-account"
        className="flex max-w-xl flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6"
      >
        <h2 id="delete-account" className="text-h3 text-ink-900">
          Delete your account
        </h2>
        <p>
          You can ask us to delete your account and personal data.{" "}
          <Link
            to="/contact?subject=general"
            className="font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Send us a request
          </Link>{" "}
          and we'll reply to confirm what we delete and any records we have to keep.
        </p>
      </section>
    </div>
  );
}
