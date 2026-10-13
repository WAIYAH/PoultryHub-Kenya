import { X } from "lucide-react";

import { formatKES } from "@/domain/money";

import { AVAILABILITY_OPTIONS, hasActiveFilters, type ShopState } from "../../shop-params";

interface Chip {
  key: string;
  label: string;
  remove: Partial<ShopState>;
}

function chips(state: ShopState): Chip[] {
  const list: Chip[] = [];
  if (state.q) list.push({ key: "q", label: `“${state.q}”`, remove: { q: "" } });
  for (const value of state.availability) {
    list.push({
      key: `availability-${value}`,
      label: AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label ?? value,
      remove: { availability: state.availability.filter((item) => item !== value) },
    });
  }
  if (state.min !== null || state.max !== null) {
    const label =
      state.min !== null && state.max !== null
        ? `${formatKES(state.min * 100)}–${formatKES(state.max * 100).replace("KSh ", "")}`
        : state.min !== null
          ? `From ${formatKES(state.min * 100)}`
          : `Up to ${formatKES((state.max ?? 0) * 100)}`;
    list.push({ key: "price", label, remove: { min: null, max: null } });
  }
  return list;
}

/** Removable chips for the active filters (DESIGN_SYSTEM.md §10.2). */
export function ActiveFilters({
  state,
  onChange,
}: {
  state: ShopState;
  onChange: (change: Partial<ShopState>) => void;
}) {
  if (!hasActiveFilters(state)) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="sr-only">Active filters:</span>
      <ul className="flex flex-wrap gap-2">
        {chips(state).map((chip) => (
          <li key={chip.key}>
            <button
              type="button"
              onClick={() => onChange(chip.remove)}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-forest-100 py-1 pr-2.5 pl-3.5 text-sm font-semibold text-forest-900 hover:bg-forest-200"
            >
              {chip.label}
              <X aria-hidden="true" className="size-4" />
              <span className="sr-only">(remove filter)</span>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onChange({ q: "", availability: [], min: null, max: null })}
        className="min-h-9 px-2 text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
