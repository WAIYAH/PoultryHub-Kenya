import { ServicesView } from "@/features/content/components/services-view";
import { pageMeta } from "@/lib/seo";
import { getServices } from "@/services";

import type { Route } from "./+types/services";

// Services (SITE-06): pre-rendered; only services marked as offered.

export async function loader() {
  return { services: await getServices().content.listServices() };
}

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Services",
    description:
      "Eggs, chicks, live birds, feeds, bulk and regular supply, and farming guidance, with delivery or pick-up.",
    path: "/services",
  });

export default function ServicesRoute({ loaderData }: Route.ComponentProps) {
  return <ServicesView services={loaderData.services} />;
}
