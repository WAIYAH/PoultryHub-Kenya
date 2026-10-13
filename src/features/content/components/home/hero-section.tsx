import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { ResponsiveImage } from "@/components/shared/responsive-image";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/types/domain";

/**
 * Home hero (DESIGN_SYSTEM.md §10.1, item 3): dark panel, chips, one gold phrase, two calls to
 * action and a photo blended into the panel. The entrance is CSS-only, so pre-rendered content
 * animates before hydration and is never hidden (§12).
 */
export function HeroSection({
  hero,
  whatsappHref,
}: {
  hero: HomeContent["hero"];
  whatsappHref: string | null;
}) {
  return (
    <section aria-labelledby="hero-title" className="px-4 pt-4 sm:px-6 lg:px-8">
      <div
        data-surface="dark"
        className="relative mx-auto grid max-w-[1200px] overflow-hidden rounded-xl bg-forest-900 bg-[radial-gradient(circle_at_85%_10%,rgb(250_204_21/0.10),transparent_40%),radial-gradient(circle_at_0%_100%,rgb(4_120_87/0.45),transparent_55%)] text-white lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="relative z-10 flex flex-col gap-6 px-6 pt-10 pb-8 sm:px-10 sm:pt-14 lg:py-20 lg:pr-4 lg:pl-14">
          <ul
            className="flex animate-rise-in flex-wrap gap-2 text-eyebrow"
            aria-label="What we sell"
          >
            {hero.chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full border border-white/25 px-3 py-1 text-forest-200"
              >
                {chip}
              </li>
            ))}
          </ul>
          <h1 id="hero-title" className="animate-rise-in text-display [animation-delay:80ms]">
            {hero.headline} <span className="text-gold-400">{hero.highlight}</span>
          </h1>
          <p className="max-w-xl animate-rise-in text-lead text-forest-200 [animation-delay:160ms]">
            {hero.lead}
          </p>
          <div className="flex animate-rise-in flex-wrap gap-3 [animation-delay:240ms]">
            <Button asChild variant="accent" size="lg">
              <Link to={hero.primaryCta.href}>
                {hero.primaryCta.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {whatsappHref ? (
              <Button asChild variant="outline-inverse" size="lg">
                <WhatsAppLink href={whatsappHref}>
                  <WhatsAppIcon className="size-5" /> {hero.secondaryCta.label}
                </WhatsAppLink>
              </Button>
            ) : (
              <Button asChild variant="outline-inverse" size="lg">
                <Link to="/contact">Contact us</Link>
              </Button>
            )}
          </div>
        </div>

        {hero.image ? (
          <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[30rem]">
            <ResponsiveImage
              src={hero.image.src}
              srcSet={hero.image.srcSet}
              sources={hero.image.sources}
              alt={hero.image.alt}
              width={hero.image.width}
              height={hero.image.height}
              sizes="(min-width: 1024px) 560px, 100vw"
              priority
              className="absolute inset-0 size-full"
            />
            {/* Blend the photo into the panel: from the top on phones, from the left on desktop. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-b from-forest-900 to-transparent to-35% lg:bg-linear-to-r lg:via-forest-900/20 lg:to-transparent lg:to-100%"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
