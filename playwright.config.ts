import { defineConfig, devices } from "@playwright/test";

// E2E against the production build served like the real static host (TESTING.md §4).
// PRs run mobile-360 + desktop-chrome; set E2E_FULL_MATRIX=1 for every browser and viewport.
const PORT = 4173;
const baseURL = `http://127.0.0.1:${PORT}`;
const fullMatrix = Boolean(process.env.E2E_FULL_MATRIX);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: { baseURL, trace: "on-first-retry" },
  webServer: {
    command: `pnpm build && node scripts/serve-static.mjs --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      VITE_APP_ENV: "development",
      VITE_DATA_SOURCE: "mock",
      VITE_SITE_URL: baseURL,
    },
  },
  projects: [
    { name: "mobile-360", use: { ...devices["Pixel 5"], viewport: { width: 360, height: 800 } } },
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    ...(fullMatrix
      ? [
          { name: "mobile-safari", use: { ...devices["iPhone 13"] } },
          {
            name: "tablet",
            use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } },
          },
          {
            name: "desktop-firefox",
            use: { ...devices["Desktop Firefox"], viewport: { width: 1280, height: 800 } },
          },
          {
            name: "desktop-webkit",
            use: { ...devices["Desktop Safari"], viewport: { width: 1280, height: 800 } },
          },
        ]
      : []),
  ],
});
