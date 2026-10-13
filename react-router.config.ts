import type { Config } from "@react-router/dev/config";

import { resolvePrerenderPaths } from "./src/config/prerender";
import { loadDynamicPrerenderPaths } from "./src/config/prerender-data";

// Rendering strategy: ARCHITECTURE.md §4 (ADR-001).
// No runtime server: public pages are pre-rendered at build time, everything else is served
// by __spa-fallback.html and rendered in the browser.
export default {
  appDirectory: "src",
  ssr: false,
  async prerender({ getStaticPaths }) {
    return resolvePrerenderPaths(getStaticPaths(), await loadDynamicPrerenderPaths());
  },
} satisfies Config;
