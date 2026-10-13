import { NavLink, Outlet, redirect } from "react-router";

import { Container } from "@/components/shared/container";
import { signInPath } from "@/features/auth";
import { cn } from "@/lib/utils";
import { getServices } from "@/services";

import type { Route } from "./+types/account-layout";

const accountNav = [
  { label: "Overview", href: "/account", end: true },
  { label: "Orders", href: "/account/orders" },
  { label: "Profile", href: "/account/profile" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Security", href: "/account/security" },
];

/**
 * Signed-out visitors go to sign-in and come back here afterwards (ARCHITECTURE.md §7.7). This
 * only steers the UI: the data source refuses another customer's data either way (RLS, Phase 3).
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const session = await getServices().auth.getSession();
  if (!session) {
    const url = new URL(request.url);
    throw redirect(signInPath(`${url.pathname}${url.search}`));
  }
  return null;
}

/** Account area tabs (FR-ACC). */
export default function AccountLayout() {
  return (
    <Container className="flex flex-col gap-8 py-10 lg:flex-row lg:gap-12">
      <nav aria-label="Account" className="lg:w-56 lg:shrink-0">
        <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
          {accountNav.map((item) => (
            <li key={item.href} className="shrink-0">
              <NavLink
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-700 hover:bg-forest-50 lg:rounded-md",
                    isActive && "bg-forest-100 text-forest-900",
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </Container>
  );
}
