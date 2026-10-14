import { OrderHistoryPage } from "@/features/account";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/orders";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Your orders",
    description: "All your PoultryHub Kenya orders.",
    path: "/account/orders",
    noindex: true,
  });

export default function AccountOrdersRoute() {
  return <OrderHistoryPage />;
}
