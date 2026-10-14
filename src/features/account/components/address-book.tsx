import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapPin, Plus } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKenyanMobile } from "@/domain/phone";
import { errorMessage } from "@/lib/errors";
import { notifySuccess } from "@/lib/notify";
import { getServices } from "@/services";
import type { Address } from "@/types/domain";

import type { AddressValues } from "../account-schemas";
import { accountKeys, accountQueries } from "../queries";

import { AddressForm } from "./address-form";

const MAX_ADDRESSES = 10; // ACC-05

type Editing = { kind: "new" } | { kind: "edit"; address: Address } | null;

/** Saved addresses (ACC-05): up to 10, one of them the default that checkout fills in. */
export function AddressBook() {
  const queryClient = useQueryClient();
  const addresses = useQuery(accountQueries.addresses());
  const profile = useQuery(accountQueries.profile());
  const [editing, setEditing] = useState<Editing>(null);
  const refresh = () => queryClient.invalidateQueries({ queryKey: accountKeys.addresses() });

  const save = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: AddressValues }) =>
      getServices().account.saveAddress({
        ...(id ? { id } : {}),
        ...values,
        deliveryAreaId: values.deliveryAreaId || null,
        directions: values.directions.trim() || null,
      }),
    onSuccess: async (saved) => {
      // Show the saved address straight away (only one can be the default), then refetch.
      queryClient.setQueryData<Address[]>(accountKeys.addresses(), (current = []) => {
        const others = current
          .filter((address) => address.id !== saved.id)
          .map((address) => (saved.isDefault ? { ...address, isDefault: false } : address));
        const index = current.findIndex((address) => address.id === saved.id);
        return index === -1
          ? [...others, saved]
          : [...others.slice(0, index), saved, ...others.slice(index)];
      });
      setEditing(null);
      notifySuccess(`${saved.label} saved`);
      await refresh();
    },
  });

  const makeDefault = useMutation({
    mutationFn: (address: Address) =>
      getServices().account.saveAddress({ ...address, isDefault: true }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (address: Address) => getServices().account.deleteAddress(address.id),
    onSuccess: async (_, address) => {
      notifySuccess(`${address.label} deleted`);
      await refresh();
    },
  });

  const list = addresses.data ?? [];
  const full = list.length >= MAX_ADDRESSES;
  const defaults = {
    name: profile.data?.fullName ?? "",
    phone: profile.data?.phone ? formatKenyanMobile(profile.data.phone) : "",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-ink-900">Addresses</h1>
          <p className="text-ink-700">Your default address fills in checkout. Save up to 10.</p>
        </div>
        {editing === null && addresses.data && list.length > 0 ? (
          <Button type="button" onClick={() => setEditing({ kind: "new" })} disabled={full}>
            <Plus aria-hidden="true" /> Add an address
          </Button>
        ) : null}
      </div>
      {full && editing === null ? (
        <p className="text-sm text-ink-700" role="status">
          You've saved 10 addresses, the most allowed. Delete one to add another.
        </p>
      ) : null}

      {editing ? (
        <AddressForm
          key={editing.kind === "edit" ? editing.address.id : "new"}
          address={editing.kind === "edit" ? editing.address : null}
          defaults={defaults}
          saving={save.isPending}
          error={save.isError ? errorMessage(save.error) : null}
          onSave={(values) =>
            save.mutate({ id: editing.kind === "edit" ? editing.address.id : undefined, values })
          }
          onCancel={() => {
            save.reset();
            setEditing(null);
          }}
        />
      ) : null}

      {addresses.isPending ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : addresses.isError ? (
        <ErrorState
          title="We couldn't load your addresses"
          onRetry={() => void addresses.refetch()}
          retrying={addresses.isFetching}
        />
      ) : list.length === 0 && editing === null ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses"
          description="Save where you'd like deliveries to go, and checkout fills it in for you."
          actions={
            <Button type="button" onClick={() => setEditing({ kind: "new" })}>
              <Plus aria-hidden="true" /> Add an address
            </Button>
          }
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2" data-testid="address-list">
          {list.map((address) => (
            <li
              key={address.id}
              className="flex flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-ink-900">{address.label}</h2>
                {address.isDefault ? (
                  <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs font-semibold text-forest-900">
                    Default
                  </span>
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5">
                <p>
                  {address.recipientName} · {formatKenyanMobile(address.phone)}
                </p>
                <p>{address.addressLine}</p>
                <p>
                  {address.town}, {address.county}
                </p>
                {address.directions ? <p className="text-ink-600">{address.directions}</p> : null}
                {address.deliveryAreaId ? null : (
                  <p className="text-ink-600">Outside our delivery areas: pick-up only.</p>
                )}
              </div>
              <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing({ kind: "edit", address })}
                >
                  Edit<span className="sr-only"> {address.label}</span>
                </Button>
                {address.isDefault ? null : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    loading={makeDefault.isPending && makeDefault.variables.id === address.id}
                    onClick={() => makeDefault.mutate(address)}
                  >
                    Make default<span className="sr-only"> ({address.label})</span>
                  </Button>
                )}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="text-danger">
                      Delete<span className="sr-only"> {address.label}</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {address.label}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {address.addressLine}, {address.town}. This can't be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep it</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => remove.mutate(address)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
      {remove.isError || makeDefault.isError ? (
        <p className="text-sm text-danger" role="alert">
          {errorMessage(remove.error ?? makeDefault.error)}
        </p>
      ) : null}
    </div>
  );
}
