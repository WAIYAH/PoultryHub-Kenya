import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Testimonial } from "@/types/domain";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

/**
 * Consented testimonials (BR-31) in a CSS scroll-snap carousel: swipe on touch, previous/next
 * buttons and dot tabs for keyboard users, no autoplay (DESIGN_SYSTEM.md §13). Initials avatars
 * only; photos need separate consent.
 */
export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  function scrollTo(index: number) {
    const track = trackRef.current;
    const slide = track?.children[index] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActive(index);
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const width = (track.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
    setActive(Math.round(track.scrollLeft / width));
  }

  return (
    <div
      className="flex flex-col gap-6"
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:mx-0 sm:px-0"
      >
        {testimonials.map((testimonial, index) => (
          <li
            key={testimonial.id}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${testimonials.length}`}
            className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
          >
            <figure className="flex h-full flex-col gap-4 rounded-lg bg-white p-6 shadow-card">
              <Quote aria-hidden="true" className="size-7 text-forest-600" />
              <blockquote className="flex-1 text-ink-900">“{testimonial.quote}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-full bg-forest-100 font-bold text-forest-800"
                >
                  {initials(testimonial.authorName)}
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold text-ink-900">{testimonial.authorName}</span>
                  <span className="text-sm text-ink-600">{testimonial.authorDescriptor}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {testimonials.length > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous testimonial"
            disabled={active === 0}
            onClick={() => scrollTo(active - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <div role="tablist" aria-label="Choose a testimonial" className="flex gap-1">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Testimonial ${index + 1}`}
                onClick={() => scrollTo(index)}
                className="grid size-6 place-items-center"
              >
                <span
                  className={
                    index === active
                      ? "size-2.5 rounded-full bg-forest-900"
                      : "size-2.5 rounded-full bg-ink-400"
                  }
                />
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next testimonial"
            disabled={active === testimonials.length - 1}
            onClick={() => scrollTo(active + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
