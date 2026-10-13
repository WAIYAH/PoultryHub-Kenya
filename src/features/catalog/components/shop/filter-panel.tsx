import { useId, useState, type FormEvent } from "react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/domain";

import {
  AVAILABILITY_OPTIONS,
  hasActiveFilters,
  type AvailabilityFilter,
  type ShopState,
} from "../../shop-params";

/**
 * Shop filters (CAT-02): category, availability and price. Used in the desktop sidebar and inside
 * the mobile filter sheet. Native controls keep it light (it ships with every shop page).
 */
export function FilterPanel({
  state,
  categories,
  currentCategory,
  categoryHref,
  onChange,
  onNavigate,
}: {
  state: ShopState;
  categories: Category[];
  currentCategory: string | null;
  /** Link for a category (null = all products), keeping the other filters. */
  categoryHref: (slug: string | null) => string;
  onChange: (change: Partial<ShopState>) => void;
  onNavigate?: () => void;
}) {
  const id = useId();

  function toggleAvailability(value: AvailabilityFilter, checked: boolean) {
    onChange({
      availability: checked
        ? [...state.availability, value]
        : state.availability.filter((item) => item !== value),
    });
  }

  return (
    <div className="flex flex-col gap-7">
      <section aria-labelledby={`${id}-categories`} className="flex flex-col gap-2">
        <h2 id={`${id}-categories`} className="text-sm font-bold text-ink-900">
          Category
        </h2>
        <ul className="flex flex-col gap-0.5">
          {[{ slug: null, name: "All products" }, ...categories].map((category) => {
            const active = category.slug === currentCategory;
            return (
              <li key={category.slug ?? "all"}>
                <Link
                  to={categoryHref(category.slug)}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center justify-between rounded-md px-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-forest-100 font-semibold text-forest-900"
                      : "text-ink-700 hover:bg-forest-50 hover:text-ink-900",
                  )}
                >
                  {category.name}
                  {"productCount" in category ? (
                    <span className="text-xs text-ink-600" data-tabular>
                      {category.productCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold text-ink-900">Availability</legend>
        {AVAILABILITY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-ink-900 hover:bg-forest-50"
          >
            <input
              type="checkbox"
              checked={state.availability.includes(option.value)}
              onChange={(event) => toggleAvailability(option.value, event.target.checked)}
              className="size-5 shrink-0 cursor-pointer rounded-sm accent-forest-700"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <PriceFilter key={`${state.min}-${state.max}`} state={state} onChange={onChange} />

      {hasActiveFilters(state) ? (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => onChange({ q: "", availability: [], min: null, max: null })}
        >
          Clear all filters
        </Button>
      ) : null}
    </div>
  );
}

function PriceFilter({
  state,
  onChange,
}: {
  state: ShopState;
  onChange: (change: Partial<ShopState>) => void;
}) {
  const id = useId();
  const [min, setMin] = useState(state.min === null ? "" : String(state.min));
  const [max, setMax] = useState(state.max === null ? "" : String(state.max));

  function apply(event: FormEvent) {
    event.preventDefault();
    const toNumber = (value: string) => (/^\d+$/.test(value.trim()) ? Number(value.trim()) : null);
    onChange({ min: toNumber(min), max: toNumber(max) });
  }

  const input =
    "h-11 w-full min-w-0 rounded-md border border-input bg-white px-3 text-base text-ink-900 tabular-nums focus-visible:border-ring";

  return (
    <form onSubmit={apply} className="flex flex-col gap-2" aria-labelledby={`${id}-price`}>
      <h2 id={`${id}-price`} className="text-sm font-bold text-ink-900">
        Price (KSh)
      </h2>
      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm text-ink-700">
          From
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="0"
            value={min}
            onChange={(event) => setMin(event.target.value.replace(/\D/g, ""))}
            className={input}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm text-ink-700">
          To
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Any"
            value={max}
            onChange={(event) => setMax(event.target.value.replace(/\D/g, ""))}
            className={input}
          />
        </label>
      </div>
      <Button type="submit" variant="secondary" size="sm" className="w-fit">
        Apply price
      </Button>
    </form>
  );
}
