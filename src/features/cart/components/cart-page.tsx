import { ArrowLeft, ArrowRight, LockKeyhole, RotateCw } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { errorMessage } from "@/lib/errors";

import { useCartReady, useCartStore } from "../cart.store";
import { hasBlockingLineIssues, useCartQuote } from "../use-cart-quote";

import { CartEmpty } from "./cart-empty";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";
import { DeliveryEstimate } from "./delivery-estimate";
import { PromoCodeField } from "./promo-code-field";

const CRUMBS = [{ label: "Home", href: "/" }, { label: "Cart" }];

/**
 * Full cart page (CART-01 to CART-07): lines with server-checked prices and one-tap fixes, promo
 * code, delivery estimate and the summary. The cart is saved on the device and works offline;
 * prices need a connection.
 */
export function CartPage() {
  const ready = useCartReady();
  const lines = useCartStore((state) => state.lines);
  const promoCode = useCartStore((state) => state.promoCode);
  const deliveryAreaId = useCartStore((state) => state.deliveryAreaId);
  const setPromoCode = useCartStore((state) => state.setPromoCode);
  const setDeliveryAreaId = useCartStore((state) => state.setDeliveryAreaId);
  const quote = useCartQuote();
  const blocked = hasBlockingLineIssues(quote.data);

  if (!ready) {
    return (
      <>
        <PageHeader title="Your cart" crumbs={CRUMBS} />
        <Container className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-busy="true">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <span className="sr-only">Loading your cart…</span>
        </Container>
      </>
    );
  }

  if (lines.length === 0) {
    return (
      <>
        <PageHeader title="Your cart" crumbs={CRUMBS} />
        <Container className="py-10 sm:py-14">
          <CartEmpty />
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Your cart"
        description={`${lines.length} ${lines.length === 1 ? "item" : "items"}, saved on this device.`}
        crumbs={CRUMBS}
      />
      <Container className="grid grid-cols-1 items-start gap-8 py-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        <div className="flex flex-col gap-4">
          {quote.isError ? (
            <div
              role="alert"
              className="flex flex-col gap-3 rounded-lg bg-danger-bg p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
            >
              <p>
                {errorMessage(quote.error)} Your cart is saved on this device; prices update when
                you're back online.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit shrink-0"
                onClick={() => void quote.refetch()}
              >
                <RotateCw aria-hidden="true" /> Try again
              </Button>
            </div>
          ) : null}
          <ul className="divide-y divide-line rounded-lg bg-white px-4 shadow-card sm:px-6">
            {lines.map((line) => (
              <CartLineItem
                key={line.variantId}
                line={line}
                quoteLine={quote.data?.lines.find((q) => q.variantId === line.variantId)}
                quoteLoading={quote.isFetching}
              />
            ))}
          </ul>
          <Link
            to="/shop"
            className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-forest-700 underline-offset-4 hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Continue shopping
          </Link>
        </div>

        <aside
          aria-label="Order summary"
          className="flex flex-col gap-6 rounded-lg bg-white p-5 shadow-card sm:p-6 lg:sticky lg:top-24"
        >
          <CartSummary quote={quote.data} itemCount={lines.length} pending={quote.isFetching} />
          <PromoCodeField
            code={promoCode}
            quote={quote.data}
            pending={quote.isFetching}
            onApply={setPromoCode}
            onRemove={() => setPromoCode(null)}
          />
          <DeliveryEstimate
            areaId={deliveryAreaId}
            onAreaChange={setDeliveryAreaId}
            quote={quote.data}
          />
          <div className="flex flex-col gap-2">
            {blocked ? (
              <p className="text-sm text-warning-fg" role="status">
                Fix the highlighted items to check out.
              </p>
            ) : null}
            {blocked ? (
              <Button size="lg" disabled className="w-full">
                Checkout <ArrowRight aria-hidden="true" />
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full">
                <Link to="/checkout" data-testid="cart-checkout">
                  Checkout <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            )}
            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-ink-600">
              <LockKeyhole aria-hidden="true" className="size-3.5" /> Pay with M-Pesa, on delivery
              or at pick-up
            </p>
          </div>
        </aside>
      </Container>
    </>
  );
}
