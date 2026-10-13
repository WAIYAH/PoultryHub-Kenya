import { MapPin, Store, Truck } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { formatKES } from "@/domain/money";
import { AreaSelector, etaText } from "@/features/delivery";
import type { CartQuote, DeliveryArea, PickupLocation, QuoteIssue } from "@/types/domain";

import { fieldId, type CheckoutValues } from "../checkout-form";

import { ChoiceCard, ChoiceGroup } from "./choice-cards";
import { TextAreaField, TextField } from "./text-field";

/**
 * Delivery or pick-up (CHK-02): county → configured area → estate, street or building → landmark
 * and directions → instructions; or a pick-up point. Delivery is offered only to listed areas
 * (BR-13, BR-15) and not at all when an item is pick-up only (BR-14).
 */
export function FulfilmentFields({
  areas,
  pickups,
  quote,
  collectionOnly,
}: {
  areas: DeliveryArea[];
  pickups: PickupLocation[];
  quote: CartQuote | undefined;
  /** Some item can only be collected (BR-14). */
  collectionOnly: boolean;
}) {
  const {
    control,
    register,
    setValue,
    getValues,
    formState: { errors, isSubmitted },
  } = useFormContext<CheckoutValues>();
  const [fulfilment, county, deliveryAreaId] = useWatch({
    control,
    name: ["fulfilment", "county", "deliveryAreaId"],
  });
  const set = (name: "county" | "deliveryAreaId" | "town" | "fulfilment", value: string) =>
    setValue(name, value as never, { shouldDirty: true, shouldValidate: isSubmitted });

  function chooseArea(areaId: string) {
    const previous = areas.find((area) => area.id === getValues("deliveryAreaId"));
    const next = areas.find((area) => area.id === areaId);
    set("deliveryAreaId", areaId);
    // The area is usually the town; prefill it unless the customer typed something else.
    const town = getValues("town").trim();
    if (next && (town === "" || town === previous?.name)) set("town", next.name);
  }

  const minimum = quote?.issues.find(
    (issue): issue is Extract<QuoteIssue, { code: "BELOW_MINIMUM_ORDER" }> =>
      issue.code === "BELOW_MINIMUM_ORDER",
  );
  const notServed = quote?.issues.some((issue) => issue.code === "AREA_NOT_SERVED");
  const deliveryFee =
    fulfilment === "delivery" && quote?.deliveryFeeMinor != null
      ? quote.deliveryFeeMinor === 0
        ? "Free"
        : formatKES(quote.deliveryFeeMinor)
      : null;

  return (
    <>
      <ChoiceGroup name="fulfilment" legend="How would you like to get your order?" hideLegend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            {...register("fulfilment")}
            value="delivery"
            disabled={collectionOnly}
            title={
              <span className="inline-flex items-center gap-2">
                <Truck aria-hidden="true" className="size-4 text-forest-700" /> Delivery
              </span>
            }
            aside={deliveryFee}
            description="To your door in the areas we serve."
            disabledReason={
              collectionOnly ? "Some items in your order are pick-up only." : undefined
            }
          />
          <ChoiceCard
            {...register("fulfilment")}
            value="collection"
            title={
              <span className="inline-flex items-center gap-2">
                <Store aria-hidden="true" className="size-4 text-forest-700" /> Pick-up
              </span>
            }
            aside="Free"
            description="Collect from our farm gate or a collection point."
          />
        </div>
      </ChoiceGroup>

      {fulfilment === "delivery" ? (
        <div className="flex flex-col gap-5" data-testid="delivery-fields">
          <AreaSelector
            areas={areas}
            county={county}
            areaId={deliveryAreaId}
            onCountyChange={(value) => set("county", value)}
            onAreaChange={chooseArea}
            countyError={errors.county?.message}
            areaError={errors.deliveryAreaId?.message}
            onChooseCollection={() => set("fulfilment", "collection")}
            ids={{ county: fieldId("county"), area: fieldId("deliveryAreaId") }}
          />
          {quote?.delivery ? (
            <p
              className="rounded-md bg-forest-50 px-4 py-3 text-sm text-forest-900"
              aria-live="polite"
            >
              {quote.delivery.zoneName}: {quote.delivery.schedule}, usually{" "}
              {etaText(quote.delivery)}.
            </p>
          ) : null}
          {minimum ? (
            <p className="rounded-md bg-warning-bg px-4 py-3 text-sm text-warning-fg" role="status">
              Delivery to this area needs a minimum order of {formatKES(minimum.minimumMinor)}. Add
              more items, or choose pick-up.
            </p>
          ) : null}
          {notServed ? (
            <p className="rounded-md bg-danger-bg px-4 py-3 text-sm text-danger" role="status">
              We don't deliver to this area any more. Choose another area or pick-up.
            </p>
          ) : null}
          <TextField
            {...register("town")}
            label="Town or neighbourhood"
            autoComplete="address-level3"
            error={errors.town?.message}
          />
          <TextField
            {...register("addressLine")}
            label="Estate, street or building"
            hint="e.g. Greenfield Estate, House 14"
            autoComplete="street-address"
            error={errors.addressLine?.message}
          />
          <TextAreaField
            {...register("directions")}
            label="Landmark and directions"
            hint="Helps the rider find you, e.g. gate opposite the Shell petrol station."
            optional
            rows={2}
            error={errors.directions?.message}
          />
          <TextField
            {...register("instructions")}
            label="Delivery instructions"
            hint="e.g. Call when you arrive."
            optional
            error={errors.instructions?.message}
          />
        </div>
      ) : (
        <ChoiceGroup
          name="pickupLocationId"
          legend="Choose a pick-up point"
          error={errors.pickupLocationId?.message}
        >
          {pickups.map((pickup) => (
            <ChoiceCard
              key={pickup.id}
              {...register("pickupLocationId")}
              value={pickup.id}
              title={`${pickup.name}, ${pickup.town}`}
              description={
                <>
                  <span className="block">{pickup.addressLine}</span>
                  <span className="block">{pickup.directions}</span>
                  <span className="block text-ink-600">
                    {pickup.openingHours.map((h) => `${h.days}: ${h.hours}`).join(" · ")}
                  </span>
                  {pickup.mapUrl ? (
                    <a
                      href={pickup.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex min-h-8 items-center gap-1 font-semibold text-forest-700 underline-offset-4 hover:underline"
                    >
                      <MapPin aria-hidden="true" className="size-4" /> Map (opens in a new tab)
                    </a>
                  ) : null}
                </>
              }
            />
          ))}
        </ChoiceGroup>
      )}
    </>
  );
}
