import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Motion is loaded only where an interaction needs it: exit and layout animations that CSS can't
// express well (cart drawer lines, payment panel states). Wrap those components in <MotionScope>;
// never wrap the whole app, which would put ~20 KB gzip on every page (spike S4).
const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

export function MotionScope({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
