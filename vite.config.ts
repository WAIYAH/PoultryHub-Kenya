import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// App modules that only declare things (components, hooks, stores, helpers). Marking them free of
// side effects lets Rollup drop whatever a page doesn't use from a feature's index.ts barrel;
// otherwise importing CartLink from "@/features/cart" pulls the whole cart UI onto every page
// (NFR-PERF-3). Route modules, layouts, root and CSS keep the default (side effects assumed).
const SIDE_EFFECT_FREE =
  /[\\/]src[\\/](features|components|lib|domain|config|services|mocks)[\\/].*\.tsx?$/;

// Shared building blocks (helpers, UI components, icons, TanStack Query) used by at least
// COMMON_MIN_ROUTES chunks go into one "common" chunk. Left to itself, Rolldown splits code by the
// exact set of routes using it, so each new route fragments these small modules into more tiny
// files (60 on the home page by milestone 4, 25 of them a single icon), and every file costs its
// own gzip and import overhead. 6 measured best: 4 pulled too much onto every page, 12 left the
// fragments (NFR-PERF-3). Admin code must never join this chunk: keep admin-only folders out of
// the test (ARCHITECTURE.md §10), and recheck the icons when the admin routes land in Phase 5.
const COMMON_CHUNK =
  /[\\/](src[\\/](domain|lib|config|components[\\/](layout|shared|ui))|node_modules[\\/].*(lucide-react|@tanstack))[\\/]/;
const COMMON_MIN_ROUTES = 6;

export default defineConfig(({ mode }) => {
  // Expose VITE_* values from .env files to Node-side config (routes.ts, react-router.config.ts),
  // which otherwise only see the shell environment. Shell values take precedence.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "VITE_"))) {
    process.env[key] ??= value;
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: { tsconfigPaths: true },
    build: {
      rollupOptions: {
        treeshake: {
          moduleSideEffects: (id) => !SIDE_EFFECT_FREE.test(id.split("?")[0] ?? id),
        },
        output: {
          codeSplitting: {
            groups: [{ name: "common", test: COMMON_CHUNK, minShareCount: COMMON_MIN_ROUTES }],
          },
        },
      },
    },
  };
});
