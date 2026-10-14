import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { PageLinks } from "@/components/shared/page-links";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { accountQueries } from "../queries";

import { OrderHistoryList } from "./order-history-list";

/** All of the customer's orders (ORD-03, ACC-06), ten per page, with the page in the URL. */
export function OrderHistoryPage() {
  const [searchParams] = useSearchParams();
  const requested = Number(searchParams.get("page"));
  const page = Number.isInteger(requested) && requested > 0 ? requested : 1;
  const orders = useQuery({ ...accountQueries.orders(page), placeholderData: keepPreviousData });
  const pageCount = orders.data
    ? Math.max(1, Math.ceil(orders.data.total / orders.data.pageSize))
    : 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-h1 text-ink-900">Your orders</h1>
        {orders.data && orders.data.total > 0 ? (
          <p className="text-ink-700">
            {orders.data.total} {orders.data.total === 1 ? "order" : "orders"}
          </p>
        ) : null}
      </div>
      {orders.isPending ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : orders.isError ? (
        <ErrorState
          title="We couldn't load your orders"
          description="Check your connection and try again."
          onRetry={() => void orders.refetch()}
          retrying={orders.isFetching}
        />
      ) : orders.data.items.length === 0 ? (
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
        <div className={orders.isPlaceholderData ? "opacity-60 transition-opacity" : undefined}>
          <OrderHistoryList orders={orders.data.items} />
        </div>
      )}
      <PageLinks
        page={page}
        pageCount={pageCount}
        hrefFor={(p) => (p === 1 ? "/account/orders" : `/account/orders?page=${p}`)}
        label="Order pages"
      />
    </div>
  );
}
