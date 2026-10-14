import { ForgotPasswordPage } from "@/features/auth";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/forgot-password";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Forgot your password?",
    description: "Get a link to choose a new password.",
    path: "/auth/forgot-password",
    noindex: true,
  });

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
