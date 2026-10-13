// Motion's animation features, loaded asynchronously by <LazyMotion> in root.tsx so they stay out
// of the initial bundle (NFR-PERF-3). Until they arrive, `m.*` components render without animating,
// which is fine because nothing is ever hidden before hydration (DESIGN_SYSTEM.md §12).
import { domAnimation } from "motion/react";

export default domAnimation;
