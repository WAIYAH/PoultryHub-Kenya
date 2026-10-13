import { FaqList } from "@/components/shared/faq-list";
import { DeliveryInfo } from "@/features/delivery";
import type { DeliveryZone, Faq, PickupLocation, ProductDetail } from "@/types/domain";

/**
 * Below the buy box (DESIGN_SYSTEM.md §10.2): description, specifications, delivery and pick-up,
 * and common questions. Plain sections rather than tabs, so everything is in the pre-rendered
 * HTML and readable without JavaScript (NFR-COMP-3).
 */
export function ProductDetails({
  product,
  zones,
  pickups,
  faqs,
}: {
  product: ProductDetail;
  zones: DeliveryZone[];
  pickups: PickupLocation[];
  faqs: Faq[];
}) {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <div className="flex flex-col gap-10">
        <section aria-labelledby="about-product" className="flex flex-col gap-4">
          <h2 id="about-product" className="text-h2 text-ink-900">
            About this product
          </h2>
          {product.description.split(/\n{2,}/).map((paragraph) => (
            <p key={paragraph} className="max-w-prose text-ink-700">
              {paragraph}
            </p>
          ))}
        </section>
        {product.specifications.length > 0 ? (
          <section aria-labelledby="specifications" className="flex flex-col gap-4">
            <h2 id="specifications" className="text-h3 text-ink-900">
              Specifications
            </h2>
            <dl className="divide-y divide-line rounded-lg bg-white text-sm shadow-card">
              {product.specifications.map((spec) => (
                <div
                  key={spec.label}
                  className="grid grid-cols-[minmax(7rem,35%)_1fr] gap-4 px-5 py-3"
                >
                  <dt className="font-semibold text-ink-900">{spec.label}</dt>
                  <dd className="text-ink-700">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      <div className="flex flex-col gap-10">
        <section
          id="delivery"
          aria-labelledby="delivery-heading"
          className="flex scroll-mt-28 flex-col gap-4"
        >
          <h2 id="delivery-heading" className="text-h3 text-ink-900">
            Delivery &amp; pick-up
          </h2>
          <DeliveryInfo zones={zones} pickups={pickups} collectionOnly={product.collectionOnly} />
        </section>
        {faqs.length > 0 ? (
          <section aria-labelledby="product-faqs" className="flex flex-col gap-4">
            <h2 id="product-faqs" className="text-h3 text-ink-900">
              Questions
            </h2>
            <FaqList faqs={faqs} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
