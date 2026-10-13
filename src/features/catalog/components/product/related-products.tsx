import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import type { Category, ProductSummary } from "@/types/domain";

import { ProductGrid } from "../product-grid";

/** "More from this category" below the product details (CAT-05). */
export function RelatedProducts({
  category,
  products,
}: {
  category: Pick<Category, "name" | "slug">;
  products: ProductSummary[];
}) {
  const name = category.name.toLowerCase();
  return (
    <section aria-labelledby="related-heading" className="bg-forest-50 py-12 sm:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="related-heading" className="text-h2 text-ink-900">
            More {name}
          </h2>
          <Link
            to={`/shop/${category.slug}`}
            className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            View all {name}
          </Link>
        </div>
        <ProductGrid products={products} />
      </Container>
    </section>
  );
}
