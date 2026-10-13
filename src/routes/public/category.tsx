import { Link, data, isRouteErrorResponse } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { DEFAULT_SHOP_STATE, ShopView, catalogQueries, toProductQuery } from "@/features/catalog";
import { getQueryClient } from "@/lib/query-client";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";

import type { Route } from "./+types/category";

// Category landing page (CAT-04): pre-rendered for every active category, with its intro and
// metadata. Filters work as on /shop; the canonical URL is the category page itself.

async function loadCategory(slug: string) {
  const queryClient = getQueryClient();
  const categories = await queryClient.ensureQueryData(catalogQueries.categories());
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw data(null, { status: 404, statusText: "Category not found" });
  const initialPage = await queryClient.ensureQueryData(
    catalogQueries.products(toProductQuery(DEFAULT_SHOP_STATE, slug)),
  );
  return { categories, category, initialPage, loadedAt: Date.now() };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadCategory(params.categorySlug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadCategory(params.categorySlug);
}

function crumbsFor(name: string) {
  return [{ label: "Home", href: "/" }, { label: "Shop", href: "/shop" }, { label: name }];
}

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData) {
    return pageMeta({
      title: "Category not found",
      description: "This category is not available.",
      path: location.pathname,
      noindex: true,
    });
  }
  const { category } = loaderData;
  const path = `/shop/${category.slug}`;
  return pageMeta({
    title: category.name,
    description: category.description,
    path,
    jsonLd: breadcrumbJsonLd(crumbsFor(category.name), path),
  });
};

export default function CategoryRoute({ loaderData }: Route.ComponentProps) {
  const { category } = loaderData;
  return (
    <ShopView
      key={category.slug}
      title={category.name}
      description={category.description}
      crumbs={crumbsFor(category.name)}
      categories={loaderData.categories}
      category={category}
      initialPage={loaderData.initialPage}
      loadedAt={loaderData.loadedAt}
    />
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Container className="flex flex-col items-center gap-5 py-20 text-center">
      <h1 className="text-h1 text-ink-900">
        {notFound ? "Category not found" : "We couldn't load this category"}
      </h1>
      <p className="max-w-lg text-lead text-ink-600">
        {notFound
          ? "This category may have been renamed or removed."
          : "Please check your connection and try again."}
      </p>
      <Button asChild>
        <Link to="/shop">Browse all products</Link>
      </Button>
    </Container>
  );
}
