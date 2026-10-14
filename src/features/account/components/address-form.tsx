import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";
import { useForm, useWatch } from "react-hook-form";

import { FieldShell, TextAreaField, TextField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { COUNTY_NAMES_SORTED } from "@/domain/counties";
import { formatKenyanMobile } from "@/domain/phone";
import { deliveryQueries } from "@/features/delivery";
import type { Address } from "@/types/domain";

import { addressSchema, type AddressValues } from "../account-schemas";

const select =
  "h-11 w-full rounded-md border border-input bg-white px-3 text-base text-ink-900 focus-visible:border-ring aria-invalid:border-destructive disabled:bg-forest-50 disabled:text-ink-600";

function toValues(
  address: Address | null,
  defaults: { name: string; phone: string },
): AddressValues {
  return {
    label: address?.label ?? "",
    recipientName: address?.recipientName ?? defaults.name,
    phone: address ? formatKenyanMobile(address.phone) : defaults.phone,
    county: address?.county ?? "",
    deliveryAreaId: address?.deliveryAreaId ?? "",
    town: address?.town ?? "",
    addressLine: address?.addressLine ?? "",
    directions: address?.directions ?? "",
    isDefault: address?.isDefault ?? false,
  };
}

/**
 * Add or edit a saved address (ACC-05). Any of the 47 counties can be saved; the delivery area
 * list shows only the areas we serve there (BR-13), so an address can be saved for pick-up too.
 */
export function AddressForm({
  address,
  defaults,
  saving,
  error,
  onSave,
  onCancel,
}: {
  address: Address | null;
  defaults: { name: string; phone: string };
  saving: boolean;
  error: string | null;
  onSave: (values: AddressValues) => void;
  onCancel: () => void;
}) {
  const id = useId();
  const areas = useQuery(deliveryQueries.areas());
  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: toValues(address, defaults),
    mode: "onTouched",
  });
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = form;
  const county = useWatch({ control, name: "county" });
  const inCounty = (areas.data ?? [])
    .filter((area) => area.county === county)
    .sort((a, b) => a.name.localeCompare(b.name, "en-KE"));
  const field = (name: keyof AddressValues) => `${id}-${name}`;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(onSave)}
      className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
      aria-label={address ? `Edit ${address.label}` : "Add an address"}
    >
      <h2 className="text-h3 text-ink-900">
        {address ? `Edit ${address.label}` : "Add an address"}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField
          {...register("label")}
          id={field("label")}
          label="Name for this address"
          hint="e.g. Home, Shop, Farm"
          error={errors.label?.message}
        />
        <TextField
          {...register("recipientName")}
          id={field("recipientName")}
          label="Recipient's name"
          autoComplete="name"
          error={errors.recipientName?.message}
        />
      </div>
      <TextField
        {...register("phone")}
        id={field("phone")}
        label="Recipient's phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        error={errors.phone?.message}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FieldShell
          name="county"
          id={field("county")}
          label="County"
          error={errors.county?.message}
        >
          {(controlProps) => (
            <select
              {...register("county", {
                onChange: () => setValue("deliveryAreaId", ""),
              })}
              {...controlProps}
              autoComplete="address-level1"
              className={select}
            >
              <option value="">Choose a county</option>
              {COUNTY_NAMES_SORTED.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
        <FieldShell
          name="deliveryAreaId"
          id={field("deliveryAreaId")}
          label="Delivery area"
          optional
          hint={
            county && areas.data && inCounty.length === 0
              ? "We don't deliver in this county yet. You can still save it for pick-up orders."
              : undefined
          }
        >
          {(controlProps) => (
            <select
              {...register("deliveryAreaId", {
                onChange: () => {
                  const area = areas.data?.find((a) => a.id === getValues("deliveryAreaId"));
                  if (area && !getValues("town").trim()) setValue("town", area.name);
                },
              })}
              {...controlProps}
              aria-required={undefined}
              disabled={!county || inCounty.length === 0}
              className={select}
            >
              <option value="">{county ? "Not a delivery area" : "Choose a county first"}</option>
              {inCounty.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          )}
        </FieldShell>
      </div>
      <TextField
        {...register("town")}
        id={field("town")}
        label="Town or neighbourhood"
        autoComplete="address-level3"
        error={errors.town?.message}
      />
      <TextField
        {...register("addressLine")}
        id={field("addressLine")}
        label="Estate, street or building"
        hint="e.g. Greenfield Estate, House 14"
        autoComplete="street-address"
        error={errors.addressLine?.message}
      />
      <TextAreaField
        {...register("directions")}
        id={field("directions")}
        label="Landmark and directions"
        optional
        rows={2}
        error={errors.directions?.message}
      />
      <label className="flex cursor-pointer items-center gap-3 text-sm text-ink-900">
        <input
          type="checkbox"
          {...register("isDefault")}
          className="size-5 shrink-0 cursor-pointer accent-forest-700"
        />
        Use this as my default delivery address
      </label>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={saving}>
          {address ? "Save address" : "Add address"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
