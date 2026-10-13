import { ProfilePage } from "@/features/account";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/profile";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Profile",
    description: "Your name, phone and message preferences.",
    path: "/account/profile",
    noindex: true,
  });

export default function AccountProfileRoute() {
  return <ProfilePage />;
}
