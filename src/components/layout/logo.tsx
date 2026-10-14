import { Link } from "react-router";

import { cn } from "@/lib/utils";

/** Placeholder brand mark (egg + sprout) until the business supplies its logo (PLAN.md D2). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
      className={cn("size-10 shrink-0", className)}
    >
      <circle cx="20" cy="20" r="20" fill="#064e3b" />
      <path
        d="M20 8.5c-5.6 0-9.4 7.6-9.4 13.9 0 5.6 4.1 9.4 9.4 9.4s9.4-3.8 9.4-9.4C29.4 16.1 25.6 8.5 20 8.5Z"
        fill="#faf8f1"
      />
      <path d="M20 27.5c0-4.4 2.4-7.4 6-8.3 0 4-2.4 7.2-6 8.3Z" fill="#facc15" />
      <path d="M20 27.5c-3.1-.8-5.2-3.4-5.2-6.8 3.1.6 5.2 3.1 5.2 6.8Z" fill="#047857" />
    </svg>
  );
}

export function Logo({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      viewTransition
      to="/"
      className={cn("inline-flex items-center gap-2.5 rounded-full", className)}
    >
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "text-lg font-extrabold tracking-tight",
            tone === "dark" ? "text-white" : "text-forest-900",
          )}
        >
          PoultryHub
        </span>
        <span
          className={cn(
            "mt-0.5 text-[0.6875rem] font-semibold tracking-[0.22em] uppercase",
            tone === "dark" ? "text-gold-400" : "text-forest-700",
          )}
        >
          Kenya
        </span>
      </span>
    </Link>
  );
}
