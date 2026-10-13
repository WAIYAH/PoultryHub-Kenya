import { SignUpPage } from "@/features/auth";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/sign-up";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Create an account",
    description: "Create an account to save your details and see your orders.",
    path: "/auth/sign-up",
    noindex: true,
  });

export default function SignUpRoute() {
  return <SignUpPage />;
}
