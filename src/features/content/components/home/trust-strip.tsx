import { Container } from "@/components/shared/container";
import { IconCircle } from "@/components/shared/content-icon";
import type { IconPoint, SiteSettings } from "@/types/domain";

/**
 * Trust strip (SITE-03): verified statistics once an admin has entered them; until then, facts
 * about how the service works. Never invented numbers (BR-31).
 */
export function TrustStrip({
  stats,
  facts,
}: {
  stats: SiteSettings["trustStats"];
  facts: IconPoint[];
}) {
  return (
    <Container className="relative z-10 -mt-px py-8 sm:py-10">
      {stats.length > 0 ? (
        <dl className="grid grid-cols-2 gap-4 rounded-lg bg-white p-5 shadow-card lg:grid-cols-4 lg:divide-x lg:divide-line lg:p-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <dd className="order-first text-h2 text-forest-900" data-tabular>
                {stat.value}
              </dd>
              <dt className="text-sm text-ink-600">{stat.label}</dt>
            </div>
          ))}
        </dl>
      ) : (
        <ul
          aria-label="How ordering works with us"
          className="grid grid-cols-1 gap-4 rounded-lg bg-white p-5 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:p-6"
        >
          {facts.map((fact) => (
            <li key={fact.title} className="flex items-start gap-3">
              <IconCircle name={fact.icon} size="sm" />
              <span className="flex flex-col">
                <span className="font-semibold text-ink-900">{fact.title}</span>
                {fact.text ? <span className="text-sm text-ink-600">{fact.text}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
