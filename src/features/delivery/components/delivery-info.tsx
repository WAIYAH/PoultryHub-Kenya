import { MapPin, Store, Truck } from "lucide-react";
import { Link } from "react-router";

import { formatKES } from "@/domain/money";
import type { DeliveryZone, PickupLocation } from "@/types/domain";

export function etaText(zone: Pick<DeliveryZone, "etaMinDays" | "etaMaxDays">): string {
  return zone.etaMinDays === zone.etaMaxDays
    ? `${zone.etaMinDays} day${zone.etaMinDays === 1 ? "" : "s"}`
    : `${zone.etaMinDays}–${zone.etaMaxDays} days`;
}

/**
 * Delivery and pick-up details for a product (CAT-05), straight from the zone configuration
 * (BR-16: no promises beyond it). Pick-up-only products show pick-up points alone (BR-14).
 */
export function DeliveryInfo({
  zones,
  pickups,
  collectionOnly,
}: {
  zones: DeliveryZone[];
  pickups: PickupLocation[];
  collectionOnly: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      {collectionOnly ? (
        <p className="flex gap-3 rounded-md bg-info-bg p-4 text-info-fg">
          <Store aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          This item is pick-up only. Collect it from a pick-up point below.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900">
            <Truck aria-hidden="true" className="size-5 text-forest-700" /> Delivery
          </h3>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line bg-white text-sm">
            {zones.map((zone) => (
              <li key={zone.id} className="flex flex-col gap-0.5 px-4 py-3" data-tabular>
                <span className="font-semibold text-ink-900">
                  {zone.name}: {formatKES(zone.feeMinor)}
                  {zone.freeOverMinor !== null
                    ? `, free over ${formatKES(zone.freeOverMinor)}`
                    : ""}
                </span>
                <span className="text-ink-700">
                  {zone.schedule} · usually {etaText(zone)}
                  {zone.minOrderMinor !== null
                    ? ` · minimum order ${formatKES(zone.minOrderMinor)}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-ink-700">
            Choose your county and area at checkout to see the exact fee.{" "}
            <Link
              to="/policies/delivery-and-returns"
              className="font-semibold text-forest-700 underline-offset-4 hover:underline"
            >
              Delivery and returns
            </Link>
          </p>
        </div>
      )}
      {pickups.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-ink-900">
            <MapPin aria-hidden="true" className="size-5 text-forest-700" /> Pick-up points (free)
          </h3>
          <ul className="flex flex-col gap-3 text-sm">
            {pickups.map((pickup) => (
              <li key={pickup.id} className="rounded-md border border-line bg-white px-4 py-3">
                <p className="font-semibold text-ink-900">
                  {pickup.name}, {pickup.town}
                </p>
                <p className="text-ink-700">{pickup.addressLine}</p>
                <p className="text-ink-700">
                  {pickup.openingHours.map((h) => `${h.days}: ${h.hours}`).join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
