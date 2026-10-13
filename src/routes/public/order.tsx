import { useParams, useSearchParams } from "react-router";

import { OrderPage } from "@/features/orders";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/order";

// Order confirmation, payment and tracking (CHK-06): client-rendered for the owner's session or
// the guest's secret ?token= link; never indexed.

export const meta: Route.MetaFunction = ({ params, location }) =>
  pageMeta({
    title: `Order ${params.orderNumber.toUpperCase()}`,
    description: "Your order's status, payment and details.",
    path: location.pathname,
    noindex: true,
  });

export default function OrderRoute() {
  const { orderNumber = "" } = useParams();
  const [searchParams] = useSearchParams();
  return (
    <OrderPage key={orderNumber} orderNumber={orderNumber} token={searchParams.get("token")} />
  );
}
