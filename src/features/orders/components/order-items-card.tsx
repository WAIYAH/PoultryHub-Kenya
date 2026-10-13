import { Egg } from "lucide-react";
import { Link } from "react-router";

import { formatKES } from "@/domain/money";
import { formatQuantity, unitLabel } from "@/domain/units";
import { thumbnailSrc } from "@/features/cart";
import type { OrderDetail } from "@/types/domain";

function Row({ label, value, testId }: { label: string; value: string; testId?: string }) {
  return (
    <div className="flex justify-between gap-4 text-ink-700">
      <dt>{label}</dt>
      <dd data-tabular data-testid={testId}>
        {value}
      </dd>
    </div>
  );
}

/** The items and totals as recorded when the order was placed (BR-04, ORD-04). */
export function OrderItemsCard({ order }: { order: OrderDetail }) {
  const deliveryValue =
    order.fulfilmentMethod === "collection"
      ? "Pick-up: free"
      : order.deliveryFeeMinor === 0
        ? "Free"
        : formatKES(order.deliveryFeeMinor);

  return (
    <section
      aria-labelledby="order-items-heading"
      className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-card sm:p-6 print:shadow-none"
    >
      <h2 id="order-items-heading" className="text-h3 text-ink-900">
        Items
      </h2>
      <ul className="flex flex-col divide-y divide-line">
        {order.items.map((item, index) => {
          const image = thumbnailSrc(item.image);
          return (
            <li
              key={`${item.productName}-${item.variantName}-${index}`}
              className="flex gap-3 py-3"
            >
              <span className="size-14 shrink-0 overflow-hidden rounded-md bg-cream-100 print:hidden">
                {image ? (
                  <img
                    src={image}
                    alt=""
                    width={56}
                    height={56}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="grid size-full place-items-center text-earth-700">
                    <Egg aria-hidden="true" className="size-5 opacity-60" strokeWidth={1.5} />
                  </span>
                )}
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap justify-between gap-x-4 gap-y-1">
                <div className="min-w-0">
                  {item.productSlug ? (
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="font-semibold text-ink-900 hover:underline"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-semibold text-ink-900">{item.productName}</p>
                  )}
                  <p className="text-sm text-ink-600" data-tabular>
                    {item.variantName} · {formatQuantity(item.quantity, item.unit)} ×{" "}
                    {formatKES(item.unitPriceMinor)} / {unitLabel(item.unit)}
                  </p>
                </div>
                <p className="font-semibold text-ink-900" data-tabular>
                  {formatKES(item.lineTotalMinor)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <dl className="flex flex-col gap-2 border-t border-line pt-4">
        <Row label="Subtotal" value={formatKES(order.subtotalMinor)} />
        {order.discountMinor > 0 ? (
          <Row
            label={order.promoCode ? `Discount (${order.promoCode})` : "Discount"}
            value={`−${formatKES(order.discountMinor)}`}
          />
        ) : null}
        <Row label="Delivery" value={deliveryValue} />
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-lg font-bold text-ink-900">
          <dt>Total</dt>
          <dd data-tabular data-testid="order-total">
            {formatKES(order.totalMinor)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
