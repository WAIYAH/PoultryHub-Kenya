import { Reveal } from "@/components/shared/reveal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ProductSummary } from "@/types/domain";

import { ProductCard } from "./product-card";

const GRID = "grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4";

/**
 * Product grid: 2 → 3 → 4 columns (CAT-01). Cards reveal with a 40 ms stagger capped at 8 items
 * (DESIGN_SYSTEM.md §12); the first `priorityCount` images load eagerly.
 */
export function ProductGrid({
  products,
  priorityCount = 0,
  headingLevel = 3,
  showFeaturedBadge = true,
  className,
}: {
  products: ProductSummary[];
  priorityCount?: number;
  headingLevel?: 2 | 3;
  showFeaturedBadge?: boolean;
  className?: string;
}) {
  return (
    <ul className={cn(GRID, className)} data-testid="product-grid">
      {products.map((product, index) => (
        <li key={product.id}>
          <Reveal delay={Math.min(index, 8) * 40} className="h-full">
            <ProductCard
              product={product}
              priority={index < priorityCount}
              headingLevel={headingLevel}
              showFeaturedBadge={showFeaturedBadge}
            />
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/** Loading state with the same dimensions as the grid (DESIGN_SYSTEM.md §11). */
export function ProductGridSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <ul className={cn(GRID, className)} aria-hidden="true" data-testid="product-grid-skeleton">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex flex-col overflow-hidden rounded-lg bg-white shadow-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="mt-2 h-9 w-full rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
