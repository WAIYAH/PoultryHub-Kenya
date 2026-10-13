import { ArrowRight, Truck } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Reveal } from "@/components/shared/reveal";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { formatKES } from "@/domain/money";
import type { DeliveryZone, HomeContent } from "@/types/domain";

function etaText(zone: DeliveryZone): string {
  return zone.etaMinDays === zone.etaMaxDays
    ? `${zone.etaMinDays} day${zone.etaMinDays === 1 ? "" : "s"}`
    : `${zone.etaMinDays}–${zone.etaMaxDays} days`;
}

/**
 * How ordering works: three steps plus a delivery summary straight from the zone settings
 * (SITE-02, BR-16: nothing promised beyond the configured times).
 */
export function HowToOrder({
  content,
  zones,
}: {
  content: HomeContent["howToOrder"];
  zones: DeliveryZone[];
}) {
  return (
    <Section>
      <Container className="flex flex-col gap-10">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          lead={content.lead}
          align="center"
        />
        <ol className="grid gap-5 md:grid-cols-3">
          {content.steps.map((step, index) => (
            <li key={step.title}>
              <Reveal delay={index * 60} className="h-full">
                <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-cream-50 p-6">
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-full bg-forest-900 text-base font-bold text-white"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-h3 text-ink-900">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="text-ink-700">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        {zones.length > 0 ? (
          <Reveal>
            <div className="flex flex-col gap-5 rounded-lg bg-forest-50 p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Truck aria-hidden="true" className="size-6 text-forest-700" strokeWidth={1.75} />
                <h3 className="text-h3 text-ink-900">Delivery at a glance</h3>
              </div>
              <ul className="flex flex-col divide-y divide-line text-sm sm:hidden">
                {zones.map((zone) => (
                  <li key={zone.id} className="flex flex-col gap-1 py-3 first:pt-0">
                    <span className="font-semibold text-ink-900">{zone.name}</span>
                    <span className="text-ink-700" data-tabular>
                      {formatKES(zone.feeMinor)}
                      {zone.freeOverMinor !== null
                        ? ` · free over ${formatKES(zone.freeOverMinor)}`
                        : ""}
                    </span>
                    <span className="text-ink-700">
                      {zone.schedule} · usually {etaText(zone)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="hidden sm:block">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Delivery zones, fees and days</caption>
                  <thead className="text-ink-700">
                    <tr className="border-b border-line">
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Zone
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Fee
                      </th>
                      <th scope="col" className="py-2 pr-4 font-semibold">
                        Delivery days
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Usually arrives in
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-ink-900" data-tabular>
                    {zones.map((zone) => (
                      <tr key={zone.id} className="border-b border-line last:border-0">
                        <th scope="row" className="py-3 pr-4 font-semibold">
                          {zone.name}
                        </th>
                        <td className="py-3 pr-4">
                          {formatKES(zone.feeMinor)}
                          {zone.freeOverMinor !== null ? (
                            <span className="block text-ink-600">
                              Free over {formatKES(zone.freeOverMinor)}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 pr-4">{zone.schedule}</td>
                        <td className="py-3">{etaText(zone)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-ink-700">
                Not in these areas? Choose pick-up at checkout, or ask us on WhatsApp.{" "}
                <Link
                  to="/policies/delivery-and-returns"
                  className="inline-flex items-center gap-1 font-semibold text-forest-700 underline-offset-4 hover:underline"
                >
                  Delivery details <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </p>
            </div>
          </Reveal>
        ) : null}
      </Container>
    </Section>
  );
}
