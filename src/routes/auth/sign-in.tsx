import { SignInPage } from "@/features/auth";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/sign-in";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Sign in",
    description: "Sign in to see your orders and check out faster.",
    path: "/auth/sign-in",
    noindex: true,
  });

export default function SignInRoute() {
  return <SignInPage />;
}
