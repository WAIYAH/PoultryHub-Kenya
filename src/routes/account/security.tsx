import { SecuritySettings } from "@/features/account";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/security";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Security",
    description: "Password and signed-in devices.",
    path: "/account/security",
    noindex: true,
  });

export default function AccountSecurityRoute() {
  return <SecuritySettings />;
}
