import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Expose VITE_* values from .env files to Node-side config (routes.ts, react-router.config.ts),
  // which otherwise only see the shell environment. Shell values take precedence.
  for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), "VITE_"))) {
    process.env[key] ??= value;
  }

  return {
    plugins: [tailwindcss(), reactRouter()],
    resolve: { tsconfigPaths: true },
  };
});
