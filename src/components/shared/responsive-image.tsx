import { Egg } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ImageAsset, ImageSource } from "@/types/domain";

/**
 * Image with explicit dimensions (no layout shift) and lazy loading by default
 * (DESIGN_SYSTEM.md §8). `sources` render a `<picture>` for art direction and AVIF. Without an
 * image it renders the designed placeholder tile, never a broken-image icon.
 */
export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  srcSet,
  sizes,
  sources,
  priority = false,
  label,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
  sources?: ImageSource[];
  /** Above-the-fold LCP image: eager + high fetch priority. */
  priority?: boolean;
  /** Text shown on the placeholder tile when there is no image (e.g. the product name). */
  label?: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 bg-cream-100 p-4 text-center text-earth-700",
          className,
        )}
      >
        <Egg aria-hidden="true" className="size-10 opacity-60" strokeWidth={1.5} />
        {label ? (
          <span aria-hidden="true" className="line-clamp-2 text-sm font-semibold text-ink-700">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  const img = (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? undefined : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
  if (!sources?.length) return img;
  return (
    <picture className="contents">
      {sources.map((source) => (
        <source
          key={`${source.media ?? "all"}-${source.type ?? "img"}`}
          srcSet={source.srcSet}
          type={source.type}
          media={source.media}
          sizes={sizes}
          width={source.width}
          height={source.height}
        />
      ))}
      {img}
    </picture>
  );
}

/** Spreads an ImageAsset (or nothing) into ResponsiveImage props at a given placeholder shape. */
export function imageProps(
  image: ImageAsset | null | undefined,
  fallbackAlt: string,
  shape: { width: number; height: number } = { width: 960, height: 960 },
) {
  return image
    ? {
        src: image.src,
        srcSet: image.srcSet,
        sources: image.sources,
        alt: image.alt,
        width: image.width,
        height: image.height,
      }
    : { src: null, alt: fallbackAlt, ...shape };
}
