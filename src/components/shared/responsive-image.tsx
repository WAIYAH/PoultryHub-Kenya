import { Egg } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Image with explicit dimensions (no layout shift) and lazy loading by default
 * (DESIGN_SYSTEM.md §8). Renders a neutral placeholder tile when there is no image yet.
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  priority = false,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  /** Above-the-fold LCP image: eager + high fetch priority. */
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn("grid w-full place-items-center bg-cream-100 text-earth-700", className)}
      >
        <Egg aria-hidden="true" className="size-10 opacity-60" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
