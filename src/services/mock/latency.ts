// Simulated network latency for the mock data source, so loading states are real in development.
// Disabled at build time (pre-rendering) and in tests. Phase 2 adds ?mock=slow|empty|error controls.
export function simulateLatency(ms = 250): Promise<void> {
  if (import.meta.env.SSR || import.meta.env.MODE === "test") return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
