import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Link, data, isRouteErrorResponse } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ProductDetails,
  ProductGallery,
  ProductGrid,
  ProductPurchase,
  catalogQueries,
  productJsonLd,
} from "@/features/catalog";
import { getQueryClient } from "@/lib/query-client";
import { breadcrumbJsonLd, pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/product";

// Product details (CAT-05). Pre-rendered for every active product at build time; products
// published after the build load through the SPA fallback and clientLoader (spike S1). Price and
// stock revalidate in the browser; delivery and FAQ content comes with the page.

async function loadProduct(slug: string) {
  const queryClient = getQueryClient();
  const product = await queryClient.ensureQueryData(catalogQueries.product(slug));
  if (!product) throw data(null, { status: 404, statusText: "Product not found" });
  const { content, delivery } = getServices();
  const [related, zones, pickups, faqs] = await Promise.all([
    queryClient.ensureQueryData(catalogQueries.related(product.id)),
    delivery.listZones(),
    delivery.listPickupLocations(),
    content.listFaqs({ topic: "products" }),
  ]);
  return { product, related, zones, pickups, faqs, loadedAt: Date.now() };
}

export async function loader({ params }: Route.LoaderArgs) {
  return loadProduct(params.productSlug);
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return loadProduct(params.productSlug);
}

export function HydrateFallback() {
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-2" aria-busy="true">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
      <span className="sr-only">Loading product…</span>
    </Container>
  );
}

function crumbsFor(product: { name: string; category: { name: string; slug: string } }) {
  return [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.category.name, href: `/shop/${product.category.slug}` },
    { label: product.name },
  ];
}

export const meta: Route.MetaFunction = ({ loaderData, location }) => {
  if (!loaderData) {
    return pageMeta({
      title: "Product not found",
      description: "This product is not available.",
      path: location.pathname,
      noindex: true,
    });
  }
  const { product } = loaderData;
  const path = `/products/${product.slug}`;
  return pageMeta({
    title: product.name,
    description: product.shortDescription,
    path,
    type: "product",
    image: product.image
      ? { url: product.image.jpegSrc ?? product.image.src, alt: product.image.alt }
      : undefined,
    jsonLd: [productJsonLd(product), breadcrumbJsonLd(crumbsFor(product), path)],
  });
};

export default function ProductRoute({ loaderData }: Route.ComponentProps) {
  const { zones, pickups, faqs, loadedAt } = loaderData;
  // Pre-rendered prices and stock are a starting point only; refetch once the page is live.
  const { data: fresh } = useQuery({
    ...catalogQueries.product(loaderData.product.slug),
    initialData: loaderData.product,
    initialDataUpdatedAt: loadedAt,
  });
  const product = fresh ?? loaderData.product;
  const { data: related } = useQuery({
    ...catalogQueries.related(product.id),
    initialData: loaderData.related,
    initialDataUpdatedAt: loadedAt,
  });
  const crumbs = crumbsFor(product);

  return (
    <>
      <Container className="pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.label}>
                {index > 0 ? <BreadcrumbSeparator /> : null}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="line-clamp-1">{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </Container>

      <Container className="grid gap-8 py-6 sm:py-8 lg:grid-cols-2 lg:gap-14">
        <ProductGallery key={product.id} images={product.images} productName={product.name} />
        <ProductPurchase key={product.slug} product={product} zones={zones} />
      </Container>

      <Container className="py-12 sm:py-16">
        <ProductDetails product={product} zones={zones} pickups={pickups} faqs={faqs} />
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="bg-forest-50 py-12 sm:py-16">
          <Container className="flex flex-col gap-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 id="related-heading" className="text-h2 text-ink-900">
                More {product.category.name.toLowerCase()}
              </h2>
              <Link
                to={`/shop/${product.category.slug}`}
                className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
              >
                View all {product.category.name.toLowerCase()}
              </Link>
            </div>
            <ProductGrid products={related} />
          </Container>
        </section>
      ) : null}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Container className="flex flex-col items-center gap-5 py-20 text-center">
      <h1 className="text-h1 text-ink-900">
        {notFound ? "Product not found" : "We couldn't load this product"}
      </h1>
      <p className="max-w-lg text-lead text-ink-600">
        {notFound
          ? "This product may have been removed or renamed. Browse the shop to find something similar."
          : "Please check your connection and try again."}
      </p>
      <Button asChild>
        <Link to="/shop">Browse the shop</Link>
      </Button>
    </Container>
  );
}
