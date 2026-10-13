import { AccountOverview } from "@/features/account";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/overview";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Your account",
    description: "Your orders, addresses and account settings.",
    path: "/account",
    noindex: true,
  });

export default function AccountOverviewRoute() {
  return <AccountOverview />;
}
