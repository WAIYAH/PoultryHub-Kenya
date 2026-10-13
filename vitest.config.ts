import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: the React Router plugin must not run inside Vitest.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    restoreMocks: true,
  },
});
