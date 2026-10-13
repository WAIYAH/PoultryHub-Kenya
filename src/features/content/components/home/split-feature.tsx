import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Eyebrow } from "@/components/shared/eyebrow";
import { Reveal } from "@/components/shared/reveal";
import { ResponsiveImage, imageProps } from "@/components/shared/responsive-image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Cta, ImageAsset } from "@/types/domain";

/**
 * Photo + dark panel, the reference's split composition (DESIGN_SYSTEM.md §9.2), used for the
 * "About the farm" teaser.
 */
export function SplitFeature({
  eyebrow,
  title,
  body,
  cta,
  image,
  imageSide = "left",
  children,
}: {
  eyebrow: string;
  title: string;
  body: ReactNode;
  cta: Cta;
  image: ImageAsset | null;
  imageSide?: "left" | "right";
  children?: ReactNode;
}) {
  return (
    <section className="pt-14 sm:pt-20 lg:pt-24">
      <Container>
        <Reveal>
          <div
            className={cn(
              "grid overflow-hidden rounded-xl shadow-card lg:grid-cols-2",
              imageSide === "right" && "lg:[&>*:first-child]:order-2",
            )}
          >
            <ResponsiveImage
              {...imageProps(image, "", { width: 960, height: 720 })}
              alt={image?.alt ?? ""}
              sizes="(min-width: 1024px) 600px, 100vw"
              className="aspect-[4/3] h-full lg:aspect-auto"
            />
            <div
              data-surface="dark"
              className="flex flex-col justify-center gap-5 bg-forest-900 bg-[radial-gradient(circle_at_100%_0%,rgb(250_204_21/0.08),transparent_45%)] p-8 text-white sm:p-12"
            >
              <Eyebrow tone="dark">{eyebrow}</Eyebrow>
              <h2 className="text-h2">{title}</h2>
              <div className="text-lead text-forest-200">{body}</div>
              {children}
              <Button asChild variant="outline-inverse" className="w-fit">
                <Link to={cta.href}>
                  {cta.label} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
