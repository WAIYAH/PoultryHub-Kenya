import { useFormContext, useWatch } from "react-hook-form";

import { formatKES } from "@/domain/money";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethodAvailability,
  type PaymentSettings,
} from "@/domain/payment-methods";

import type { CheckoutValues } from "../checkout-form";

import { ChoiceCard, ChoiceGroup } from "./choice-cards";

/**
 * Payment methods for this order (CHK-04, BR-17): those switched off, or meant for the other
 * fulfilment method, aren't offered; pay on delivery above its limit is shown with the reason.
 */
export function PaymentOptions({
  options,
  settings,
}: {
  options: PaymentMethodAvailability[];
  settings: PaymentSettings;
}) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<CheckoutValues>();
  const selected = useWatch({ control, name: "paymentMethod" });
  const offered = options.filter((option) => option.available || option.reason === "over_limit");

  if (offered.length === 0) {
    return (
      <p className="rounded-md bg-warning-bg px-4 py-3 text-sm text-warning-fg" role="status">
        No payment method is available for this order right now. Please chat with us on WhatsApp to
        complete it.
      </p>
    );
  }

  return (
    <ChoiceGroup
      name="paymentMethod"
      legend="How would you like to pay?"
      hideLegend
      error={errors.paymentMethod?.message}
    >
      {offered.map((option) => {
        const copy = PAYMENT_METHOD_LABELS[option.method];
        const description =
          option.method === "mpesa_paybill" && settings.paybillDisplay
            ? `${copy.description} ${settings.paybillDisplay}.`
            : copy.description;
        return (
          <ChoiceCard
            key={option.method}
            {...register("paymentMethod")}
            value={option.method}
            disabled={!option.available}
            title={copy.title}
            description={description}
            disabledReason={
              !option.available && settings.payOnDeliveryMaxMinor !== null
                ? `Available for orders up to ${formatKES(settings.payOnDeliveryMaxMinor)}.`
                : undefined
            }
          />
        );
      })}
      {selected === "mpesa_stk" ? (
        <p className="text-sm text-ink-700">
          After you place your order, we'll send an M-Pesa prompt to your phone.{" "}
          <strong className="font-semibold text-ink-900">
            We will never ask for your M-Pesa PIN by call or SMS.
          </strong>
        </p>
      ) : null}
    </ChoiceGroup>
  );
}
