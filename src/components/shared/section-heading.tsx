import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Eyebrow } from "./eyebrow";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-aligned action on wide screens, e.g. a "View all products" link. */
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  tone?: "light" | "dark";
  align?: "start" | "center";
  className?: string;
}

/** Eyebrow + title + lead (+ action), the reference design's section header pattern. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  as: Heading = "h2",
  tone = "light",
  align = "start",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className,
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
        <Heading
          className={cn(
            Heading === "h1" ? "text-h1" : "text-h2",
            tone === "dark" ? "text-white" : "text-ink-900",
          )}
        >
          {title}
        </Heading>
        {lead ? (
          <p className={cn("text-lead", tone === "dark" ? "text-forest-200" : "text-ink-600")}>
            {lead}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
