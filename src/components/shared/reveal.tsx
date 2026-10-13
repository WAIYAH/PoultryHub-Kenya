import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Scroll reveal that never hides pre-rendered content (DESIGN_SYSTEM.md §12, rule 3).
 * Content renders visible. Only after hydration, and only if it starts below the fold, is it
 * armed and then revealed by a CSS transition when it scrolls into view. Uses CSS +
 * IntersectionObserver instead of Motion, keeping ~20 KB gzip out of every public page
 * (spike S4, ARCHITECTURE.md §14.2). Reduced-motion users get no animation at all.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** Milliseconds; use small staggers (≤ 60 ms per item, capped at 8 items). */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (element.getBoundingClientRect().top <= window.innerHeight) return; // already visible: never hide

    element.dataset.reveal = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = "in";
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
