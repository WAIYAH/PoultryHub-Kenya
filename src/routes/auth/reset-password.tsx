import { ResetPasswordPage } from "@/features/auth";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/reset-password";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Choose a new password",
    description: "Choose a new password for your account.",
    path: "/auth/reset-password",
    noindex: true,
  });

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
