import { useId } from "react";

import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { whatsappMessages } from "@/domain/whatsapp";
import { useSiteSettings, useWhatsappHref } from "@/features/content";
import { cn } from "@/lib/utils";
import type { DeliveryArea } from "@/types/domain";

const select =
  "h-11 w-full rounded-md border border-input bg-white px-3 text-base text-ink-900 focus-visible:border-ring aria-invalid:border-destructive disabled:bg-forest-50 disabled:text-ink-600";

/**
 * County → configured area (KM-3, BR-13, BR-15). Only counties with a served area are listed; an
 * unlisted location gets pick-up or a WhatsApp question, never an implied fee.
 */
export function AreaSelector({
  areas,
  county,
  areaId,
  onCountyChange,
  onAreaChange,
  countyError,
  areaError,
  onChooseCollection,
  className,
}: {
  areas: DeliveryArea[];
  county: string;
  areaId: string;
  onCountyChange: (county: string) => void;
  onAreaChange: (areaId: string) => void;
  countyError?: string;
  areaError?: string;
  /** Offers "Choose pick-up instead" when the customer's area isn't listed. */
  onChooseCollection?: () => void;
  className?: string;
}) {
  const id = useId();
  const settings = useSiteSettings();
  const counties = [...new Set(areas.map((area) => area.county))].sort((a, b) =>
    a.localeCompare(b, "en-KE"),
  );
  const inCounty = areas
    .filter((area) => area.county === county)
    .sort((a, b) => a.name.localeCompare(b.name, "en-KE"));
  const whatsappHref = useWhatsappHref(
    whatsappMessages.areaNotListed(settings.businessName, county || "my area"),
  );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-county`} className="text-sm font-medium text-ink-900">
            County
          </label>
          <select
            id={`${id}-county`}
            name="county"
            autoComplete="address-level1"
            value={county}
            onChange={(event) => {
              onCountyChange(event.target.value);
              onAreaChange("");
            }}
            aria-invalid={countyError ? true : undefined}
            aria-describedby={countyError ? `${id}-county-error` : undefined}
            className={select}
          >
            <option value="">Choose a county</option>
            {counties.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {countyError ? (
            <p id={`${id}-county-error`} className="text-sm text-danger">
              {countyError}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-area`} className="text-sm font-medium text-ink-900">
            Area
          </label>
          <select
            id={`${id}-area`}
            name="deliveryAreaId"
            autoComplete="address-level2"
            value={areaId}
            disabled={!county}
            onChange={(event) => onAreaChange(event.target.value)}
            aria-invalid={areaError ? true : undefined}
            aria-describedby={areaError ? `${id}-area-error` : undefined}
            className={select}
          >
            <option value="">{county ? "Choose an area" : "Choose a county first"}</option>
            {inCounty.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
          {areaError ? (
            <p id={`${id}-area-error`} className="text-sm text-danger">
              {areaError}
            </p>
          ) : null}
        </div>
      </div>
      <details className="text-sm text-ink-700">
        <summary className="inline-flex min-h-8 cursor-pointer items-center font-semibold text-forest-700">
          Your area isn't listed?
        </summary>
        <div className="mt-2 flex flex-col gap-2 rounded-md bg-forest-50 p-3">
          <p>
            We only deliver to the areas listed, so we never guess a fee. You can collect your order
            from a pick-up point, or ask us on WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3">
            {onChooseCollection ? (
              <button
                type="button"
                onClick={onChooseCollection}
                className="min-h-9 font-semibold text-forest-700 underline underline-offset-4"
              >
                Choose pick-up instead
              </button>
            ) : null}
            <WhatsAppLink
              href={whatsappHref}
              className="inline-flex min-h-9 items-center font-semibold text-forest-700 underline underline-offset-4"
            >
              Ask on WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </details>
    </div>
  );
}
