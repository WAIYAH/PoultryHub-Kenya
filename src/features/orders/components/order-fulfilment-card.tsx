import { MapPin, Store, Truck, User } from "lucide-react";

import { formatKenyanMobile } from "@/domain/phone";
import { etaText } from "@/features/delivery";
import type { OrderDetail } from "@/types/domain";

/** Where the order is going (or where to collect it) and who it's for (CHK-06, ORD-04). */
export function OrderFulfilmentCard({ order }: { order: OrderDetail }) {
  return (
    <section
      aria-labelledby="order-fulfilment-heading"
      className="flex flex-col gap-5 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6 print:shadow-none"
    >
      {order.delivery ? (
        <div className="flex flex-col gap-1.5">
          <h2
            id="order-fulfilment-heading"
            className="flex items-center gap-2 text-base font-bold text-ink-900"
          >
            <Truck aria-hidden="true" className="size-4 text-forest-700" /> Delivery
          </h2>
          <p>{order.delivery.addressLine}</p>
          <p>
            {order.delivery.town}, {order.delivery.county}
          </p>
          {order.delivery.directions ? <p>{order.delivery.directions}</p> : null}
          {order.delivery.instructions ? (
            <p>
              <span className="font-medium text-ink-900">Instructions:</span>{" "}
              {order.delivery.instructions}
            </p>
          ) : null}
          <p className="text-ink-600">
            {order.delivery.zoneName}, usually {etaText(order.delivery)} once confirmed.
          </p>
        </div>
      ) : order.pickup ? (
        <div className="flex flex-col gap-1.5">
          <h2
            id="order-fulfilment-heading"
            className="flex items-center gap-2 text-base font-bold text-ink-900"
          >
            <Store aria-hidden="true" className="size-4 text-forest-700" /> Pick-up
          </h2>
          <p className="font-medium text-ink-900">{order.pickup.name}</p>
          <p>{order.pickup.addressLine}</p>
          <p>{order.pickup.directions}</p>
          <p className="text-ink-600">
            {order.pickup.openingHours.map((h) => `${h.days}: ${h.hours}`).join(" · ")}
          </p>
          {order.pickup.mapUrl ? (
            <a
              href={order.pickup.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 w-fit items-center gap-1 font-semibold text-forest-700 underline-offset-4 hover:underline print:hidden"
            >
              <MapPin aria-hidden="true" className="size-4" /> Map (opens in a new tab)
            </a>
          ) : null}
        </div>
      ) : (
        <h2 id="order-fulfilment-heading" className="sr-only">
          Details
        </h2>
      )}

      <div className="flex flex-col gap-1.5 border-t border-line pt-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink-900">
          <User aria-hidden="true" className="size-4 text-forest-700" /> Contact
        </h3>
        <p>{order.customerName}</p>
        <p data-tabular>{formatKenyanMobile(order.customerPhone)}</p>
        {order.customerEmail ? <p>{order.customerEmail}</p> : null}
      </div>

      {order.note ? (
        <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          <h3 className="text-base font-bold text-ink-900">Your note</h3>
          <p>{order.note}</p>
        </div>
      ) : null}
    </section>
  );
}
