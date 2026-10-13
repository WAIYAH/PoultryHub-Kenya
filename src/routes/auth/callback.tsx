import { AuthCallbackPage } from "@/features/auth";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/callback";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Signing you in",
    description: "Completing a link from your email.",
    path: "/auth/callback",
    noindex: true,
  });

export default function AuthCallbackRoute() {
  return <AuthCallbackPage />;
}
