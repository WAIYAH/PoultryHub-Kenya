import { useQuery } from "@tanstack/react-query";
import { MapPin, PackageSearch, ShoppingBag, UserRound } from "lucide-react";
import type { ComponentType } from "react";
import { Link } from "react-router";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { accountQueries } from "../queries";

import { OrderHistoryList } from "./order-history-list";
import { SignOutButton } from "./sign-out-button";

const QUICK_LINKS: { label: string; href: string; icon: ComponentType<{ className?: string }> }[] =
  [
    { label: "Shop", href: "/shop", icon: ShoppingBag },
    { label: "Track an order", href: "/track-order", icon: PackageSearch },
    { label: "Addresses", href: "/account/addresses", icon: MapPin },
    { label: "Profile", href: "/account/profile", icon: UserRound },
  ];

/** Account overview (DESIGN_SYSTEM.md §10.2): a greeting, recent orders and quick actions. */
export function AccountOverview() {
  const profile = useQuery(accountQueries.profile());
  const recent = useQuery(accountQueries.orders(1, 3));
  const addresses = useQuery(accountQueries.addresses());
  const firstName = profile.data?.fullName.split(/\s+/)[0];
  const defaultAddress = addresses.data?.find((address) => address.isDefault);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 text-ink-900">
            {firstName ? `Hello, ${firstName}` : "Your account"}
          </h1>
          {profile.data ? <p className="text-ink-700">{profile.data.email}</p> : null}
        </div>
        <SignOutButton />
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Quick links">
        {QUICK_LINKS.map(({ label, href, icon: Icon }) => (
          <li key={href}>
            <Link
              to={href}
              className="flex min-h-20 flex-col items-start justify-between gap-2 rounded-lg bg-white p-4 text-sm font-semibold text-ink-900 shadow-card hover:bg-forest-50"
            >
              <Icon aria-hidden="true" className="size-5 text-forest-700" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-orders" className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 id="recent-orders" className="text-h3 text-ink-900">
            Recent orders
          </h2>
          {recent.data && recent.data.total > 0 ? (
            <Link
              to="/account/orders"
              className="text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
            >
              All orders
            </Link>
          ) : null}
        </div>
        {recent.isPending ? (
          <Skeleton className="h-40 w-full rounded-lg" />
        ) : recent.isError ? (
          <ErrorState
            title="We couldn't load your orders"
            onRetry={() => void recent.refetch()}
            retrying={recent.isFetching}
          />
        ) : recent.data.items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Your orders will appear here once you've placed one."
            actions={
              <Link to="/shop" className={buttonVariants()}>
                Browse the shop
              </Link>
            }
          />
        ) : (
          <OrderHistoryList orders={recent.data.items} />
        )}
      </section>

      {defaultAddress ? (
        <section
          aria-labelledby="default-address"
          className="flex flex-col gap-2 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card"
        >
          <h2 id="default-address" className="text-base font-bold text-ink-900">
            Default delivery address
          </h2>
          <p className="font-medium text-ink-900">{defaultAddress.label}</p>
          <p>
            {defaultAddress.addressLine}, {defaultAddress.town}, {defaultAddress.county}
          </p>
          <Link
            to="/account/addresses"
            className="w-fit font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            Manage addresses
          </Link>
        </section>
      ) : null}
    </div>
  );
}
