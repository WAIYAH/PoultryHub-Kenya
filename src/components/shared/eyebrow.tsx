import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Small pill label above section titles, as in the reference design (DESIGN_SYSTEM.md §9.2). */
export function Eyebrow({
  tone = "light",
  className,
  ...props
}: ComponentProps<"p"> & { tone?: "light" | "dark" }) {
  return (
    <p
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-eyebrow",
        tone === "light" ? "bg-forest-100 text-forest-800" : "bg-gold-400 text-ink-900",
        className,
      )}
      {...props}
    />
  );
}
