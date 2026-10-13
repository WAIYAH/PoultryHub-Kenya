import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const tones = {
  white: "bg-white",
  cream: "bg-cream-50",
  mint: "bg-forest-50",
  forest: "bg-forest-900 text-white",
} as const;

export type SectionTone = keyof typeof tones;

/** Vertical rhythm and background tone for a page section (DESIGN_SYSTEM.md §5). */
export function Section({
  tone = "white",
  className,
  ...props
}: ComponentProps<"section"> & { tone?: SectionTone }) {
  return (
    <section
      data-surface={tone === "forest" ? "dark" : undefined}
      className={cn("py-14 sm:py-20 lg:py-24", tones[tone], className)}
      {...props}
    />
  );
}
