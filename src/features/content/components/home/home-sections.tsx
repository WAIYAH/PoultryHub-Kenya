import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { Category, DeliveryZone, Faq, HomeContent } from "@/types/domain";

import { useSiteSettings } from "../../hooks";

import { CategoryGrid } from "./category-grid";
import { EggsPromo } from "./eggs-promo";
import { HeroSection } from "./hero-section";
import { HomeFaqs } from "./home-faqs";
import { HowToOrder } from "./how-to-order";
import { PracticesSection } from "./practices-section";
import { SplitFeature } from "./split-feature";
import { TrustStrip } from "./trust-strip";
import { WholesaleBand } from "./wholesale-band";

/**
 * The home page in blueprint order (DESIGN_SYSTEM.md §10.1). Sections owned by other features
 * (featured products, testimonials) arrive as slots so this feature doesn't depend on them.
 */
export function HomeSections({
  home,
  categories,
  faqs,
  zones,
  whatsappHref,
  featuredSlot,
  testimonialsSlot,
}: {
  home: HomeContent;
  categories: Category[];
  faqs: Faq[];
  zones: DeliveryZone[];
  whatsappHref: string | null;
  featuredSlot: ReactNode;
  testimonialsSlot: ReactNode;
}) {
  const settings = useSiteSettings();

  return (
    <>
      <HeroSection hero={home.hero} whatsappHref={whatsappHref} />
      <TrustStrip stats={settings.trustStats} facts={home.serviceFacts} />

      <Section tone="mint">
        <Container className="flex flex-col gap-10">
          <SectionHeading
            eyebrow="Shop by category"
            title="Everything for your table and your farm"
            lead="From fresh eggs to day-old chicks and feeds, each with clear prices and minimum orders."
            action={
              <Button asChild variant="link">
                <Link to="/shop">
                  View all products <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            }
          />
          <CategoryGrid categories={categories} />
        </Container>
      </Section>

      {featuredSlot}

      <SplitFeature
        eyebrow={home.about.eyebrow}
        title={home.about.title}
        body={<p>{home.about.body}</p>}
        cta={home.about.cta}
        image={home.about.image}
      />
      <EggsPromo promo={home.eggsPromo} />
      <PracticesSection practices={home.practices} />
      <HowToOrder content={home.howToOrder} zones={zones} />
      {testimonialsSlot}
      <HomeFaqs faqs={faqs} />
      <div className="pt-14 sm:pt-20 lg:pt-24">
        <WholesaleBand content={home.wholesale} whatsappHref={whatsappHref} />
      </div>
    </>
  );
}
