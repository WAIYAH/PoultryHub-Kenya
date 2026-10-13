import { AppError } from "@/lib/errors";

import { activeScenarios, type MockScenario } from "./scenario";

// Simulated network behaviour for the mock data source, so loading, error and retry states are
// real in development and E2E tests (ARCHITECTURE.md §7.1). Latency is fixed, not random, so tests
// are deterministic (TESTING.md §1). Disabled at build time (pre-rendering) and in unit tests.
const BASE_MS = 250;
const SLOW_MS = 2_500;

function delay(ms: number): Promise<void> {
  if (import.meta.env.SSR || import.meta.env.MODE === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Starts a simulated request: waits, then fails with NETWORK under `?mock=error`.
 * Returns the active scenarios so the caller can apply the others (empty lists, price changes…).
 */
export async function mockRequest(): Promise<ReadonlySet<MockScenario>> {
  const scenarios = activeScenarios();
  await delay(scenarios.has("slow") ? SLOW_MS : BASE_MS);
  if (scenarios.has("error")) throw new AppError("NETWORK");
  return scenarios;
}
