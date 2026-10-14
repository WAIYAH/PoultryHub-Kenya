import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { ErrorState } from "@/components/shared/error-state";
import { TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKenyanMobile } from "@/domain/phone";
import { errorMessage, isAppError } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";
import type { Profile } from "@/types/domain";

import { profileSchema, type ProfileValues } from "../account-schemas";
import { accountKeys, accountQueries } from "../queries";

/** Edit profile (ACC-04): name, phone and marketing consent. */
export function ProfilePage() {
  const profile = useQuery(accountQueries.profile());
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-ink-900">Profile</h1>
        <p className="text-ink-700">These details fill in checkout for you.</p>
      </div>
      {profile.isPending ? (
        <Skeleton className="h-80 w-full max-w-xl rounded-lg" />
      ) : profile.isError ? (
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => void profile.refetch()}
          retrying={profile.isFetching}
        />
      ) : (
        <ProfileForm profile={profile.data} />
      )}
    </div>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone ? formatKenyanMobile(profile.phone) : "",
      marketingOptIn: profile.marketingOptIn,
    },
    mode: "onTouched",
  });
  const {
    register,
    reset,
    setError,
    formState: { errors, isDirty },
  } = form;

  const save = useMutation({
    mutationFn: (values: ProfileValues) =>
      getServices().account.updateProfile({
        fullName: values.fullName,
        phone: values.phone.trim() === "" ? null : values.phone,
        marketingOptIn: values.marketingOptIn,
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData(accountKeys.profile(), saved);
      reset({
        fullName: saved.fullName,
        phone: saved.phone ? formatKenyanMobile(saved.phone) : "",
        marketingOptIn: saved.marketingOptIn,
      });
      notifySuccess("Profile saved");
    },
    onError: (error) => {
      const fields = isAppError(error, "VALIDATION_FAILED") ? error.details?.fields : undefined;
      if (typeof fields === "object" && fields !== null) {
        for (const field of ["fullName", "phone"] as const) {
          const message = (fields as Record<string, unknown>)[field];
          if (typeof message === "string") setError(field, { type: "server", message });
        }
      }
    },
  });

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((values) => save.mutate(values))}
      className="flex max-w-xl flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
      aria-label="Profile"
    >
      <TextField
        {...register("fullName")}
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
      />
      <TextField
        {...register("phone")}
        label="Phone number"
        hint="For M-Pesa and order updates, e.g. 0712 345 678."
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        optional
        error={errors.phone?.message}
      />
      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-medium text-ink-900">Email</p>
        <p className="text-ink-700">{profile.email}</p>
        <p className="text-sm text-ink-600">
          To change your email, chat with us for now. Changing it here, with a confirmation link,
          comes with live accounts.
        </p>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-700">
        <input
          type="checkbox"
          {...register("marketingOptIn")}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-forest-700"
        />
        <span>Send me offers and farm news by SMS or email.</span>
      </label>
      {save.isError && !isAppError(save.error, "VALIDATION_FAILED") ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage(save.error)}
        </p>
      ) : null}
      <Button
        type="submit"
        className="w-full sm:w-fit"
        loading={save.isPending}
        disabled={!isDirty}
      >
        Save changes
      </Button>
    </form>
  );
}
