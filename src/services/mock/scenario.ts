// Development switches for the mock data source (PLAN.md Phase 2, TESTING.md J14).
// Add `?mock=slow`, `?mock=empty`, `?mock=error` (or several, comma-separated) to any URL; the
// choice is kept for the browser tab until `?mock=off`. Checkout recovery screens have their own:
//   price-changed  every price rises by KSh 20, so an open checkout gets PRICE_CHANGED (J4)
//   low-stock      only the minimum order quantity is left of every tracked variant
//   area-closed    no delivery area is served any more (AREA_NOT_SERVED)
// Never active during pre-rendering, and never in production builds.

export type MockScenario =
  "slow" | "empty" | "error" | "price-changed" | "low-stock" | "area-closed";

const SCENARIOS: readonly MockScenario[] = [
  "slow",
  "empty",
  "error",
  "price-changed",
  "low-stock",
  "area-closed",
];
export const SCENARIO_STORAGE_KEY = "phk-mock-scenario";

const NONE: ReadonlySet<MockScenario> = new Set();

function isScenario(value: string): value is MockScenario {
  return (SCENARIOS as readonly string[]).includes(value);
}

export function activeScenarios(): ReadonlySet<MockScenario> {
  if (typeof window === "undefined" || import.meta.env.VITE_APP_ENV === "production") return NONE;
  try {
    const requested = new URLSearchParams(window.location.search).get("mock");
    if (requested !== null) {
      if (requested === "" || requested === "off") {
        window.sessionStorage.removeItem(SCENARIO_STORAGE_KEY);
      } else {
        window.sessionStorage.setItem(SCENARIO_STORAGE_KEY, requested);
      }
    }
    const stored = window.sessionStorage.getItem(SCENARIO_STORAGE_KEY) ?? "";
    return new Set(
      stored
        .split(",")
        .map((part) => part.trim())
        .filter(isScenario),
    );
  } catch {
    return NONE; // storage blocked (private mode): no scenarios
  }
}
