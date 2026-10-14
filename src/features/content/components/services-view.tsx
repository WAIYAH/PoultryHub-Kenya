import { ArrowRight, CircleCheck } from "lucide-react";
import { Link } from "react-router";

import { IconCircle } from "@/components/shared/content-icon";
import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { buttonVariants } from "@/components/ui/button";
import { whatsappMessages } from "@/domain/whatsapp";
import type { ServiceOffering } from "@/types/domain";

import { useSiteSettings, useWhatsappHref } from "../hooks";

/** Services (SITE-06): only the ones the business marks as offered. */
export function ServicesView({ services }: { services: ServiceOffering[] }) {
  const settings = useSiteSettings();
  const whatsappHref = useWhatsappHref(whatsappMessages.wholesale(settings.businessName));
  return (
    <>
      <PageHeader
        title="Our services"
        description="What we supply and how we can help, from a single tray of eggs to a regular bulk order."
        crumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />
      <Container className="flex flex-col gap-12 py-10 sm:py-14">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="services">
          {services.map((service, index) => (
            <li key={service.id} id={service.id} className="scroll-mt-24">
              <Reveal delay={Math.min(index, 8) * 40} className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-lg bg-white p-6 shadow-card">
                  <IconCircle name={service.icon} />
                  <div className="flex flex-col gap-2">
                    <h2 className="text-h3 text-ink-900">{service.title}</h2>
                    <p className="text-ink-700">{service.summary}</p>
                  </div>
                  {service.details.length > 0 ? (
                    <ul className="flex flex-col gap-2 text-sm text-ink-700">
                      {service.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2">
                          <CircleCheck
                            aria-hidden="true"
                            className="mt-0.5 size-4 shrink-0 text-forest-700"
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link
                    to={service.cta.href}
                    className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 font-semibold text-forest-700 underline-offset-4 hover:underline"
                  >
                    {service.cta.label} <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <section
          aria-labelledby="services-quote"
          className="flex flex-col gap-4 rounded-xl bg-forest-900 p-6 text-white sm:p-10"
        >
          <h2 id="services-quote" className="text-h2">
            Need a regular or bulk supply?
          </h2>
          <p className="max-w-2xl text-white/85">
            Tell us what you need and how often. We'll reply with prices and delivery days.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contact?subject=wholesale_quote"
              className={buttonVariants({ variant: "accent", size: "lg" })}
            >
              Request a quote
            </Link>
            <WhatsAppLink
              href={whatsappHref}
              className={buttonVariants({ variant: "outline-inverse", size: "lg" })}
            >
              <WhatsAppIcon className="size-5" /> Chat on WhatsApp
            </WhatsAppLink>
          </div>
        </section>
      </Container>
    </>
  );
}
