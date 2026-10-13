import { CheckoutPage } from "@/features/checkout";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/checkout";

// Checkout (CHK-01 to CHK-05): client-rendered from the device's saved cart; never indexed.

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Checkout",
    description: "Delivery or pick-up, then payment.",
    path: "/checkout",
    noindex: true,
  });

export default function CheckoutRoute() {
  return <CheckoutPage />;
}
