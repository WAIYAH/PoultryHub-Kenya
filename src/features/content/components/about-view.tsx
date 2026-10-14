import { CircleCheck } from "lucide-react";
import { Link } from "react-router";

import { IconCircle } from "@/components/shared/content-icon";
import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { buttonVariants } from "@/components/ui/button";
import type { AboutContent } from "@/types/domain";

/**
 * About (SITE-05): story, mission and vision, how we farm and what we commit to. Every block is
 * editable content; nothing here makes a claim the business hasn't entered (BR-31).
 */
export function AboutView({ about }: { about: AboutContent }) {
  return (
    <>
      <section className="border-b border-line bg-forest-50">
        <Container className="grid grid-cols-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <Eyebrow>About us</Eyebrow>
            <h1 className="text-h1 text-ink-900">{about.intro.title}</h1>
            <p className="text-lead text-ink-700">{about.intro.lead}</p>
          </div>
          <ResponsiveImage
            {...imageProps(about.intro.image, "", { width: 960, height: 720 })}
            alt={about.intro.image?.alt ?? ""}
            sizes="(min-width: 1024px) 560px, 100vw"
            priority
            className="aspect-[4/3] rounded-xl shadow-card"
          />
        </Container>
      </section>

      <Section>
        <Container className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="flex flex-col gap-4">
            <h2 className="text-h2 text-ink-900">{about.story.title}</h2>
            {about.story.paragraphs.map((paragraph) => (
              <p key={paragraph} className="max-w-prose text-ink-700">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg bg-white p-5 shadow-card">
              <h2 className="text-h3 text-ink-900">Our mission</h2>
              <p className="text-ink-700">{about.missionVision.mission}</p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-white p-5 shadow-card">
              <h2 className="text-h3 text-ink-900">Our vision</h2>
              <p className="text-ink-700">{about.missionVision.vision}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="mint">
        <Container className="flex flex-col gap-10">
          <SectionHeading title={about.practices.title} lead={about.practices.lead} />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {about.practices.points.map((point) => (
              <li
                key={point.title}
                className="flex flex-col gap-3 rounded-lg bg-white p-5 shadow-card"
              >
                <IconCircle name={point.icon} />
                <h3 className="font-bold text-ink-900">{point.title}</h3>
                {point.text ? <p className="text-sm text-ink-700">{point.text}</p> : null}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container className="flex flex-col gap-8">
          <h2 className="text-h2 text-ink-900">{about.commitments.title}</h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {about.commitments.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-ink-700">
                <CircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 text-forest-700"
                />
                {point}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/shop" className={buttonVariants({ size: "lg" })}>
              Browse the shop
            </Link>
            <Link to="/contact" className={buttonVariants({ size: "lg", variant: "outline" })}>
              Contact us
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
