import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { IconCircle } from "@/components/shared/content-icon";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button } from "@/components/ui/button";
import type { HomeContent } from "@/types/domain";

/** Bulk & wholesale band (SITE-02): photo overlay, benefits, quote request and WhatsApp. */
export function WholesaleBand({
  content,
  whatsappHref,
}: {
  content: HomeContent["wholesale"];
  whatsappHref: string | null;
}) {
  return (
    <section className="pb-14 sm:pb-20 lg:pb-24">
      <Container>
        <Reveal>
          <div
            data-surface="dark"
            className="relative isolate overflow-hidden rounded-xl bg-forest-950 text-white"
          >
            <ResponsiveImage
              {...imageProps(content.image, "", { width: 1600, height: 667 })}
              alt=""
              sizes="(min-width: 1200px) 1136px, 100vw"
              className="absolute inset-0 -z-10 size-full"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-linear-to-r from-forest-950 via-forest-950/90 to-forest-950/55"
            />
            <div className="grid gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:p-16">
              <div className="flex flex-col gap-5">
                <Eyebrow tone="dark">{content.eyebrow}</Eyebrow>
                <h2 className="text-h2">{content.title}</h2>
                <p className="text-lead text-forest-200">{content.lead}</p>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="accent" size="lg">
                    <Link to={content.cta.href}>
                      {content.cta.label} <ArrowRight aria-hidden="true" />
                    </Link>
                  </Button>
                  {whatsappHref ? (
                    <Button asChild variant="outline-inverse" size="lg">
                      <WhatsAppLink href={whatsappHref}>
                        <WhatsAppIcon className="size-5" /> WhatsApp us
                      </WhatsAppLink>
                    </Button>
                  ) : null}
                </div>
              </div>
              <ul className="flex flex-col gap-4">
                {content.points.map((point) => (
                  <li key={point.title} className="flex items-start gap-3">
                    <IconCircle name={point.icon} size="sm" tone="dark" />
                    <span className="flex flex-col">
                      <span className="font-semibold">{point.title}</span>
                      {point.text ? (
                        <span className="text-sm text-forest-200">{point.text}</span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
