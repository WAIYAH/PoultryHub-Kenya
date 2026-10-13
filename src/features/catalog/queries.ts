import { queryOptions } from "@tanstack/react-query";

import { getServices } from "@/services";
import type { ProductQuery } from "@/types/domain";

// Query keys and options for catalogue data (ARCHITECTURE.md §7.2): 60 s stale time, initial data
// from the build-time loader on pre-rendered pages, then revalidated in the browser.

export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  products: (query: ProductQuery) => [...catalogKeys.all, "products", query] as const,
  product: (slug: string) => [...catalogKeys.all, "product", slug] as const,
  related: (productId: string, limit: number) =>
    [...catalogKeys.all, "related", productId, limit] as const,
};

export const catalogQueries = {
  categories: () =>
    queryOptions({
      queryKey: catalogKeys.categories(),
      queryFn: () => getServices().catalog.listCategories(),
    }),
  products: (query: ProductQuery) =>
    queryOptions({
      queryKey: catalogKeys.products(query),
      queryFn: () => getServices().catalog.listProducts(query),
    }),
  product: (slug: string) =>
    queryOptions({
      queryKey: catalogKeys.product(slug),
      queryFn: () => getServices().catalog.getProduct(slug),
    }),
  related: (productId: string, limit = 4) =>
    queryOptions({
      queryKey: catalogKeys.related(productId, limit),
      queryFn: () => getServices().catalog.listRelated(productId, limit),
    }),
};

/** Featured products for the home page (SITE-02). */
export const FEATURED_QUERY: ProductQuery = { featured: true, pageSize: 8 };
