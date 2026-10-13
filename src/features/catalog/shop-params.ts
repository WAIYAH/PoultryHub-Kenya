import type { Availability, ProductQuery, ProductSort } from "@/types/domain";

// Shop filter state lives in the URL so it can be shared and Back restores it (CAT-02, CAT-03):
//   /shop?q=mayai&availability=in_stock&min=500&max=5000&sort=price-asc&page=2
// Prices are whole shillings in the URL and minor units everywhere else.

export const SHOP_PAGE_SIZE = 24;

export type AvailabilityFilter = "in_stock" | "pre_order";

export interface ShopState {
  q: string;
  availability: AvailabilityFilter[];
  /** Whole shillings, or null for no limit. */
  min: number | null;
  max: number | null;
  sort: ProductSort;
  page: number;
}

export const DEFAULT_SHOP_STATE: ShopState = {
  q: "",
  availability: [],
  min: null,
  max: null,
  sort: "featured",
  page: 1,
};

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name: A to Z" },
];

export const AVAILABILITY_OPTIONS: { value: AvailabilityFilter; label: string }[] = [
  { value: "in_stock", label: "In stock" },
  { value: "pre_order", label: "Pre-order" },
];

const SORTS = new Set<string>(SORT_OPTIONS.map((option) => option.value));
const AVAILABILITIES = new Set<string>(AVAILABILITY_OPTIONS.map((option) => option.value));

function wholeShillings(value: string | null): number | null {
  if (value === null || !/^\d{1,7}$/.test(value.trim())) return null;
  return Number(value.trim());
}

/** Reads shop state from a query string, ignoring anything malformed. */
export function parseShopParams(params: URLSearchParams): ShopState {
  const sort = params.get("sort");
  const page = Number(params.get("page"));
  let min = wholeShillings(params.get("min"));
  let max = wholeShillings(params.get("max"));
  if (min !== null && max !== null && min > max) [min, max] = [max, min];
  return {
    q: (params.get("q") ?? "").trim().slice(0, 80),
    availability: [
      ...new Set(
        params
          .getAll("availability")
          .flatMap((value) => value.split(","))
          .filter((value): value is AvailabilityFilter => AVAILABILITIES.has(value)),
      ),
    ],
    min,
    max,
    sort: sort !== null && SORTS.has(sort) ? (sort as ProductSort) : "featured",
    page: Number.isInteger(page) && page > 1 ? page : 1,
  };
}

/** Writes shop state to a query string, omitting defaults so URLs stay short and canonical. */
export function shopSearchParams(state: ShopState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  for (const value of state.availability) params.append("availability", value);
  if (state.min !== null) params.set("min", String(state.min));
  if (state.max !== null) params.set("max", String(state.max));
  if (state.sort !== "featured") params.set("sort", state.sort);
  if (state.page > 1) params.set("page", String(state.page));
  return params;
}

/** "?q=…" or "" for links. */
export function shopSearch(state: ShopState): string {
  const query = shopSearchParams(state).toString();
  return query ? `?${query}` : "";
}

/** Any change to the filters starts again from page 1. */
export function updateShopState(state: ShopState, change: Partial<ShopState>): ShopState {
  return { ...state, ...change, page: change.page ?? 1 };
}

const AVAILABILITY_MAP: Record<AvailabilityFilter, Availability[]> = {
  in_stock: ["in_stock", "low_stock"],
  pre_order: ["pre_order"],
};

/** The catalogue query for this state (and category page, if any). */
export function toProductQuery(state: ShopState, category?: string): ProductQuery {
  return {
    ...(category ? { category } : {}),
    ...(state.q ? { q: state.q } : {}),
    ...(state.availability.length > 0
      ? { availability: state.availability.flatMap((value) => AVAILABILITY_MAP[value]) }
      : {}),
    ...(state.min !== null ? { minPriceMinor: state.min * 100 } : {}),
    ...(state.max !== null ? { maxPriceMinor: state.max * 100 } : {}),
    sort: state.sort,
    page: state.page,
    pageSize: SHOP_PAGE_SIZE,
  };
}

export function hasActiveFilters(state: ShopState): boolean {
  return (
    state.q !== "" || state.availability.length > 0 || state.min !== null || state.max !== null
  );
}
