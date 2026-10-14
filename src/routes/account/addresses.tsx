import { AddressBook } from "@/features/account";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/addresses";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Addresses",
    description: "Your saved delivery addresses.",
    path: "/account/addresses",
    noindex: true,
  });

export default function AccountAddressesRoute() {
  return <AddressBook />;
}
