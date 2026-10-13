import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { IconCircle } from "@/components/shared/content-icon";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/types/domain";

/**
 * Fresh-eggs promotion (SITE-02): earth-toned panel, photo with a round badge and only verifiable
 * benefits (DESIGN_SYSTEM.md §2: no "hormone-free" or "100% natural" claims).
 */
export function EggsPromo({ promo }: { promo: HomeContent["eggsPromo"] }) {
  return (
    <section className="bg-cream-50 py-14 sm:py-20 lg:py-24">
      <Container>
        <Reveal>
          <div className="grid items-center gap-8 rounded-xl bg-earth-100 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:p-14">
            <div className="flex flex-col gap-5">
              <Eyebrow className="bg-white text-earth-700">{promo.eyebrow}</Eyebrow>
              <h2 className="text-h2 text-ink-900">{promo.title}</h2>
              <p className="text-lead text-ink-700">{promo.lead}</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
                {promo.benefits.map((benefit) => (
                  <li
                    key={benefit.title}
                    className="flex items-center gap-3 font-semibold text-ink-900"
                  >
                    <IconCircle name={benefit.icon} size="sm" />
                    {benefit.title}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-2 w-fit">
                <Link to={promo.cta.href}>
                  {promo.cta.label} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
              <ResponsiveImage
                {...imageProps(promo.image, "", { width: 800, height: 1000 })}
                alt={promo.image?.alt ?? ""}
                sizes="(min-width: 1024px) 440px, 90vw"
                className="aspect-[4/5] rounded-xl shadow-raised"
              />
              <span
                aria-hidden="true"
                className="absolute -top-4 -left-4 grid size-24 rotate-[-10deg] place-items-center rounded-full bg-gold-400 p-3 text-center text-sm leading-tight font-extrabold text-ink-900 shadow-raised sm:size-28 sm:text-base"
              >
                {promo.badge}
              </span>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
