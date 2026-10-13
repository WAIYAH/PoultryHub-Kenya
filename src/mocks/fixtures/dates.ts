// Relative dates keep "Ready from …" batches and recent orders believable whenever the demo runs.
// Runtime imports in fixtures stay relative (no "@/" aliases): react-router.config.ts loads the
// catalogue in Node before path aliases exist.

const DAY_MS = 86_400_000;

/** Calendar date (YYYY-MM-DD, East Africa Time) `days` from now. */
export function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS + 3 * 3_600_000).toISOString().slice(0, 10);
}

/** ISO timestamp `days` (and optionally `hours`) before now. */
export function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - days * DAY_MS - hours * 3_600_000).toISOString();
}
