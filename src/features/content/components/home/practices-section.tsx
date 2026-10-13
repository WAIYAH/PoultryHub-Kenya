import { ArrowRight, CircleCheck } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/types/domain";

/** "How we farm" checklist + photo (SITE-02). Editable, and only what the business confirms. */
export function PracticesSection({ practices }: { practices: HomeContent["practices"] }) {
  return (
    <Section tone="mint">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeading
            eyebrow={practices.eyebrow}
            title={practices.title}
            lead={practices.lead}
          />
          <ul className="flex flex-col gap-3">
            {practices.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-ink-900">
                <CircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-forest-700"
                />
                {point}
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="w-fit">
            <Link to={practices.cta.href}>
              {practices.cta.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <Reveal>
          <ResponsiveImage
            {...imageProps(practices.image, "", { width: 960, height: 720 })}
            alt={practices.image?.alt ?? ""}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="aspect-[4/3] rounded-xl shadow-card"
          />
        </Reveal>
      </Container>
    </Section>
  );
}
