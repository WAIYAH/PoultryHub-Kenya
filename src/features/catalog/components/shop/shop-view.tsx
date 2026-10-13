import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { Suspense, lazy, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router";

import { WhatsAppIcon } from "@/components/shared/brand-icons";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader, type Crumb } from "@/components/shared/page-header";
import { PageLinks } from "@/components/shared/page-links";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { useWhatsappHref } from "@/features/content";
import type { Category, Page, ProductSummary } from "@/types/domain";

import { catalogQueries } from "../../queries";
import {
  DEFAULT_SHOP_STATE,
  SORT_OPTIONS,
  hasActiveFilters,
  shopSearch,
  toProductQuery,
  updateShopState,
} from "../../shop-params";
import { useShopState } from "../../use-shop-state";
import { ProductGrid, ProductGridSkeleton } from "../product-grid";

import { ActiveFilters } from "./active-filters";
import { FilterPanel } from "./filter-panel";

const loadFilterSheet = () => import("./filter-sheet");
const FilterSheet = lazy(loadFilterSheet);

/**
 * Shop and category listing (CAT-01 to CAT-04, CAT-10): filters in a sidebar (a sheet on mobile),
 * search, sort, removable chips, numbered pagination and every data state.
 */
export function ShopView({
  title,
  description,
  crumbs,
  categories,
  category,
  initialPage,
  loadedAt,
}: {
  title: string;
  description: string;
  crumbs: Crumb[];
  categories: Category[];
  /** The category page's category, or null on /shop. */
  category: Category | null;
  /** Build-time results for the default view (no filters). */
  initialPage: Page<ProductSummary>;
  loadedAt: number;
}) {
  const { state, update } = useShopState();
  const whatsappHref = useWhatsappHref();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetRequested, setSheetRequested] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const isDefault = shopSearch(state) === "";
  const basePath = category ? `/shop/${category.slug}` : "/shop";

  const products = useQuery({
    ...catalogQueries.products(toProductQuery(state, category?.slug)),
    // Build-time data seeds only the matching (unfiltered) query; prices still revalidate.
    ...(isDefault ? { initialData: initialPage, initialDataUpdatedAt: loadedAt } : {}),
    placeholderData: keepPreviousData,
  });
  const page = products.data;
  const pageCount = page ? Math.max(1, Math.ceil(page.total / page.pageSize)) : 1;
  const activeFilterCount =
    state.availability.length +
    (state.min !== null || state.max !== null ? 1 : 0) +
    (state.q ? 1 : 0);

  const panelProps = {
    state,
    categories,
    currentCategory: category?.slug ?? null,
    categoryHref: (slug: string | null) =>
      `${slug ? `/shop/${slug}` : "/shop"}${shopSearch(updateShopState(state, {}))}`,
    onChange: (change: Parameters<typeof update>[0]) => update(change),
  };

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = new FormData(event.currentTarget).get("q");
    update({ q: typeof q === "string" ? q.trim() : "" });
  }

  return (
    <>
      <PageHeader title={title} description={description} crumbs={crumbs} />
      <Container className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel {...panelProps} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <form
              role="search"
              onSubmit={submitSearch}
              className="flex flex-1 items-end gap-2 sm:max-w-sm"
            >
              <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-ink-900">
                Search {category ? category.name.toLowerCase() : "products"}
                <input
                  key={state.q}
                  type="search"
                  name="q"
                  defaultValue={state.q}
                  placeholder="e.g. mayai, chicks, layers"
                  enterKeyHint="search"
                  className="h-11 w-full rounded-full border border-input bg-white px-4 text-base text-ink-900 placeholder:text-ink-500 focus-visible:border-ring"
                />
              </label>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
            <div className="flex items-end gap-2">
              <Button
                ref={filterButtonRef}
                variant="outline"
                className="lg:hidden"
                aria-haspopup="dialog"
                onClick={() => {
                  setSheetRequested(true);
                  setSheetOpen(true);
                }}
                onPointerEnter={() => void loadFilterSheet()}
              >
                <SlidersHorizontal aria-hidden="true" />
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
              </Button>
              <label className="flex flex-col gap-1 text-sm font-medium text-ink-900">
                Sort by
                <select
                  value={state.sort}
                  onChange={(event) =>
                    update({ sort: event.target.value as (typeof SORT_OPTIONS)[number]["value"] })
                  }
                  className="h-11 rounded-full border border-input bg-white pr-9 pl-4 text-base text-ink-900 focus-visible:border-ring"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <ActiveFilters state={state} onChange={(change) => update(change)} />

          <p className="text-sm text-ink-700" aria-live="polite" data-testid="result-count">
            {page && !products.isPlaceholderData
              ? page.total === 0
                ? "No products found"
                : `${page.total} ${page.total === 1 ? "product" : "products"}${
                    pageCount > 1 ? ` · page ${state.page} of ${pageCount}` : ""
                  }`
              : "Loading products…"}
          </p>

          {products.isError && !page ? (
            <ErrorState
              title="We couldn't load products"
              description="Check your connection and try again."
              onRetry={() => void products.refetch()}
              retrying={products.isFetching}
              fallback={
                <WhatsAppLink
                  href={whatsappHref}
                  className={buttonVariants({ variant: "outline" })}
                >
                  <WhatsAppIcon className="size-5" /> Order on WhatsApp
                </WhatsAppLink>
              }
            />
          ) : !page ? (
            <ProductGridSkeleton />
          ) : page.items.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={state.q ? `No products match “${state.q}”` : "No products match these filters"}
              description="Try another word, or clear your filters."
              actions={
                <>
                  {hasActiveFilters(state) ? (
                    <Button onClick={() => update({ ...DEFAULT_SHOP_STATE, sort: state.sort })}>
                      Clear filters
                    </Button>
                  ) : null}
                  <Button asChild variant="outline">
                    <Link to="/shop">Browse all products</Link>
                  </Button>
                </>
              }
            />
          ) : (
            <div
              className={products.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}
              aria-busy={products.isPlaceholderData}
            >
              <ProductGrid products={page.items} priorityCount={2} headingLevel={2} />
            </div>
          )}

          <PageLinks
            page={state.page}
            pageCount={pageCount}
            hrefFor={(p) => `${basePath}${shopSearch(updateShopState(state, { page: p }))}`}
            label="Product pages"
          />
        </div>
      </Container>

      {sheetRequested ? (
        <Suspense fallback={null}>
          <FilterSheet
            {...panelProps}
            open={sheetOpen}
            onOpenChange={setSheetOpen}
            resultCount={page?.total ?? null}
            returnFocusRef={filterButtonRef}
          />
        </Suspense>
      ) : null}
    </>
  );
}
