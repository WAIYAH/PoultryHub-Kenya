import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Reveal } from "@/components/shared/reveal";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { formatKES } from "@/domain/money";
import type { Category } from "@/types/domain";

/** Shop-by-category cards (SITE-02): photo, name, "From KSh X" from real prices, link. */
export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {categories.map((category, index) => (
        <li key={category.id}>
          <Reveal delay={index * 60} className="h-full">
            <Link
              viewTransition
              to={`/shop/${category.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-card transition-shadow hover:shadow-raised"
            >
              <span className="overflow-hidden">
                <ResponsiveImage
                  {...imageProps(category.image, "", { width: 960, height: 720 })}
                  alt=""
                  sizes="(min-width: 1024px) 276px, 46vw"
                  className="aspect-[4/3] transition-transform duration-500 ease-out-soft group-hover:scale-[1.04]"
                />
              </span>
              <span className="flex flex-1 flex-col gap-1.5 p-4 sm:p-5">
                <span className="text-h3 text-ink-900">{category.name}</span>
                {category.fromPriceMinor !== null ? (
                  <span className="text-sm text-ink-600" data-tabular>
                    From{" "}
                    <span className="font-semibold text-ink-900">
                      {formatKES(category.fromPriceMinor)}
                    </span>
                  </span>
                ) : null}
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-forest-700">
                  Shop now
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </span>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
