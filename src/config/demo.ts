// True whenever the mock data source is in use (Phases 1–2, local development, E2E). Drives the
// demo banner, the "Demo: no payment is processed" labels and the TEST payment controls
// (TESTING.md AC-12). Production builds refuse mock data (src/lib/env.ts), so this is false there.
export const IS_DEMO = import.meta.env.VITE_DATA_SOURCE !== "supabase";
