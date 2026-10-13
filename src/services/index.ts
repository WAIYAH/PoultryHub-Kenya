import { getEnv } from "@/lib/env";

import type { Services } from "./contracts";
import { createMockServices } from "./mock";

export type { CatalogService, Services } from "./contracts";

let instance: Services | undefined;

function createServices(): Services {
  getEnv(); // fail fast, naming any misconfigured variables
  // Compared against the build-time constant so the unused implementation is tree-shaken.
  if (import.meta.env.VITE_DATA_SOURCE === "supabase") {
    throw new Error("The Supabase data source is implemented in Phase 3 (TASKS.md P3-06).");
  }
  return createMockServices();
}

/** The active data source (mock in Phases 1–2, Supabase from Phase 3). */
export function getServices(): Services {
  instance ??= createServices();
  return instance;
}
