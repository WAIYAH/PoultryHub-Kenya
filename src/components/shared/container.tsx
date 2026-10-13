import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Page-width wrapper: 1200 px max, 16 px gutter on phones (DESIGN_SYSTEM.md §5). */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
