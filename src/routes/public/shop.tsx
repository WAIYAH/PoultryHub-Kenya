import { DEFAULT_SHOP_STATE, ShopView, catalogQueries, toProductQuery } from "@/features/catalog";
import { getQueryClient } from "@/lib/query-client";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

import type { Route } from "./+types/shop";

// All products (CAT-01, CAT-02). The unfiltered first page is pre-rendered; filtered views are
// built in the browser from the URL, and their canonical URL is /shop (ARCHITECTURE.md §6.1).

const TITLE = "Shop";
const DESCRIPTION =
  "Eggs, day-old chicks, live birds, feeds and farm supplies, with clear prices per tray, chick or bag. Order online for delivery or pick-up.";
const CRUMBS = [{ label: "Home", href: "/" }, { label: TITLE }];

async function loadShop() {
  const queryClient = getQueryClient();
  const [categories, initialPage] = await Promise.all([
    queryClient.ensureQueryData(catalogQueries.categories()),
    queryClient.ensureQueryData(catalogQueries.products(toProductQuery(DEFAULT_SHOP_STATE))),
  ]);
  return { categories, initialPage, loadedAt: Date.now() };
}

export const loader = loadShop;
export const clientLoader = loadShop;

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: TITLE,
    description: DESCRIPTION,
    path: "/shop",
    jsonLd: breadcrumbJsonLd(CRUMBS, "/shop"),
  });

export default function ShopRoute({ loaderData }: Route.ComponentProps) {
  return (
    <ShopView
      title="All products"
      description={DESCRIPTION}
      crumbs={CRUMBS}
      categories={loaderData.categories}
      category={null}
      initialPage={loaderData.initialPage}
      loadedAt={loaderData.loadedAt}
    />
  );
}
