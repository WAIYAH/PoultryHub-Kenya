import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";

import { TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { DEMO_ACCOUNT, IS_DEMO } from "@/config/demo";
import { errorMessage, isAppError } from "@/lib/errors";
import { getServices } from "@/services";

import { signInSchema, type SignInValues } from "../auth-schemas";
import { safeNextPath } from "../safe-next";

import { AuthShell, FormAlert } from "./auth-shell";
import { PasswordField } from "./password-field";

/** Sign in (ACC-02), then back to where the customer was (`?next=`, same-site paths only). */
export function SignInPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const signIn = useMutation({
    mutationFn: (values: SignInValues) => getServices().auth.signIn(values),
    onSuccess: async () => {
      // Nothing from a previous session may show for this one.
      queryClient.removeQueries({ queryKey: ["account"] });
      queryClient.removeQueries({ queryKey: ["orders"] });
      await navigate(next, { replace: true });
    },
  });

  return (
    <AuthShell
      title="Sign in"
      description="See your orders, save addresses and check out faster."
      footer={
        <>
          New here?{" "}
          <Link
            to={`/auth/sign-up${next === "/account" ? "" : `?next=${encodeURIComponent(next)}`}`}
            className="font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
          . You can also check out as a guest.
        </>
      }
    >
      {IS_DEMO ? (
        <div className="flex flex-col gap-2 rounded-md bg-gold-100 p-3 text-sm text-ink-700">
          <p>
            Demo account: <span className="font-semibold text-ink-900">{DEMO_ACCOUNT.email}</span>,
            password <span className="font-semibold text-ink-900">{DEMO_ACCOUNT.password}</span>.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => {
              setValue("email", DEMO_ACCOUNT.email, { shouldValidate: true });
              setValue("password", DEMO_ACCOUNT.password, { shouldValidate: true });
            }}
          >
            Use the demo account
          </Button>
        </div>
      ) : null}

      {signIn.isError ? (
        <FormAlert>
          {errorMessage(signIn.error)}
          {isAppError(signIn.error, "EMAIL_NOT_CONFIRMED") ? (
            <>
              {" "}
              Lost the email?{" "}
              <Link to="/auth/forgot-password" className="font-semibold underline">
                Get a new link
              </Link>
              .
            </>
          ) : null}
        </FormAlert>
      ) : null}

      <form
        noValidate
        onSubmit={form.handleSubmit((values) => signIn.mutate(values))}
        className="flex flex-col gap-5"
        aria-label="Sign in"
      >
        <TextField
          {...register("email")}
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
        />
        <div className="flex flex-col gap-2">
          <PasswordField
            {...register("password")}
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
          />
          <Link
            to="/auth/forgot-password"
            className="w-fit text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" size="lg" loading={signIn.isPending} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
