import { PageHeader } from "@/components/shared/page-header";
import { Container } from "@/components/shared/container";
import { TrackOrderForm } from "@/features/orders";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/track-order";

// Track an order (CHK-07): pre-rendered; the lookup runs in the browser and shows status only.

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Track an order",
    description: "Check your order's status with its order number and your phone number.",
    path: "/track-order",
  });

export default function TrackOrderRoute() {
  return (
    <>
      <PageHeader
        title="Track an order"
        description="Enter your order number and the phone number you used. We'll show its status."
        crumbs={[{ label: "Home", href: "/" }, { label: "Track an order" }]}
      />
      <Container className="max-w-3xl py-8 sm:py-12">
        <TrackOrderForm />
      </Container>
    </>
  );
}
