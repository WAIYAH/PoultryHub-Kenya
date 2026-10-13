import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

// App modules that only declare things (components, hooks, stores, helpers). Marking them free of
// side effects lets Rollup drop whatever a page doesn't use from a feature's index.ts barrel;
// otherwise importing CartLink from "@/features/cart" pulls the whole cart UI onto every page
// (NFR-PERF-3). Route modules, layouts, root and CSS keep the default (side effects assumed).
const SIDE_EFFECT_FREE =
  /[\\/]src[\\/](features|components|lib|domain|config|services|mocks)[\\/].*\.tsx?$/;

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
      },
    },
  };
});
