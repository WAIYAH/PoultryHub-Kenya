import { useRef, useState, type KeyboardEvent } from "react";

import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/types/domain";

const SIZES = "(min-width: 1200px) 560px, (min-width: 1024px) 46vw, 100vw";

/**
 * Product gallery (CAT-05, DESIGN_SYSTEM.md §9.3): swipe with scroll-snap on phones, thumbnails,
 * arrow keys and an image counter. One image renders as a plain image; none renders the
 * placeholder tile with the product name.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length <= 1) {
    return (
      <ResponsiveImage
        {...imageProps(images[0], productName)}
        sizes={SIZES}
        priority
        label={productName}
        className="aspect-square rounded-xl shadow-card"
      />
    );
  }

  function show(next: number) {
    const track = trackRef.current;
    const clamped = Math.max(0, Math.min(images.length - 1, next));
    track?.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setIndex(clamped);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        {/* A scrolling region must be keyboard reachable (WCAG 2.1.1, axe scrollable-region-focusable),
            and arrow keys change photo (DESIGN_SYSTEM.md §9.3). */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={`${productName} photos. Use the arrow keys to change photo.`}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          onKeyDown={onKeyDown}
          onScroll={(event) => {
            const track = event.currentTarget;
            setIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
          }}
          className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain rounded-xl shadow-card"
        >
          {images.map((image, i) => (
            <div
              key={image.src}
              className="w-full shrink-0 snap-center"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${images.length}`}
            >
              <ResponsiveImage
                {...imageProps(image, productName)}
                sizes={SIZES}
                priority={i === 0}
                className="aspect-square"
              />
            </div>
          ))}
        </div>
        <span
          aria-hidden="true"
          className="absolute right-3 bottom-3 rounded-full bg-forest-950/70 px-2.5 py-1 text-xs font-semibold text-white tabular-nums"
        >
          {index + 1} / {images.length}
        </span>
      </div>
      <ul className="flex gap-2" aria-label="Choose a photo">
        {images.map((image, i) => (
          <li key={image.src}>
            <button
              type="button"
              onClick={() => show(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "block size-16 overflow-hidden rounded-md border-2 transition-colors sm:size-20",
                i === index
                  ? "border-forest-700"
                  : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <img
                src={image.srcSet?.split(",")[0]?.trim().split(/\s+/)[0] ?? image.src}
                alt=""
                width={80}
                height={80}
                loading="lazy"
                className="size-full object-cover"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
