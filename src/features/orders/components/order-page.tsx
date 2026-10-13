import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleX, Clock, PackageSearch, Printer } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/domain/dates";
import { isCustomerCancellable, orderStatusLabel, paymentStatusLabel } from "@/domain/order-status";
import { whatsappMessages } from "@/domain/whatsapp";
import { useWhatsappHref } from "@/features/content";
import { cn } from "@/lib/utils";
import type { OrderDetail, OrderRef } from "@/types/domain";

import { orderKeys, orderQueries } from "../queries";

import { CancelOrderButton } from "./cancel-order-button";
import { MpesaPaymentPanel } from "./mpesa-payment-panel";
import { OrderFulfilmentCard } from "./order-fulfilment-card";
import { OrderItemsCard } from "./order-items-card";
import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";
import { PaybillInstructions } from "./paybill-instructions";
import { TrackingLink } from "./tracking-link";

/**
 * Order page (CHK-06, ORD-01, ORD-02, ORD-04, PAY-01 to PAY-03): confirmation and next steps,
 * payment, timeline, items, delivery or pick-up details, help, and a printable receipt. Guests
 * reach it with the secret link; signed-in owners without one (BR-28).
 */
export function OrderPage({ orderNumber, token }: { orderNumber: string; token: string | null }) {
  const orderRef = useMemo<OrderRef>(
    () => ({ orderNumber: orderNumber.toUpperCase(), token }),
    [orderNumber, token],
  );
  const detail = useQuery(orderQueries.detail(orderRef));

  if (detail.isPending) {
    return (
      <Container className="flex flex-col gap-6 py-8" aria-busy="true">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <Skeleton className="h-80 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <span className="sr-only">Loading your order…</span>
      </Container>
    );
  }

  if (detail.isError) {
    return (
      <Container className="py-12">
        <h1 className="sr-only">Order {orderRef.orderNumber}</h1>
        <ErrorState
          title="We couldn't load your order"
          description="Check your connection and try again."
          onRetry={() => void detail.refetch()}
          retrying={detail.isFetching}
        />
      </Container>
    );
  }

  if (!detail.data) return <OrderNotFound orderNumber={orderRef.orderNumber} />;

  return <OrderView order={detail.data} orderRef={orderRef} />;
}

function OrderNotFound({ orderNumber }: { orderNumber: string }) {
  const whatsappHref = useWhatsappHref(whatsappMessages.orderHelp(orderNumber));
  return (
    <Container className="flex flex-col gap-6 py-12">
      <h1 className="text-h1 text-ink-900">We couldn't find this order</h1>
      <EmptyState
        icon={PackageSearch}
        title={`Order ${orderNumber} isn't available here`}
        description="Open the link from your order confirmation, or find your order with its number and the phone number you used."
        actions={
          <>
            <Link
              to={`/track-order?order=${encodeURIComponent(orderNumber)}`}
              className={buttonVariants()}
            >
              Track an order
            </Link>
            <WhatsAppLink href={whatsappHref} className={buttonVariants({ variant: "outline" })}>
              <WhatsAppIcon className="size-5" /> Ask on WhatsApp
            </WhatsAppLink>
          </>
        }
      />
    </Container>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      aria-label={title}
      className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow-card sm:p-6 print:shadow-none"
    >
      <h2 className="text-h3 text-ink-900">{title}</h2>
      {children}
    </section>
  );
}

/** What happens next, by payment method (CHK-06). */
function NextSteps({ order }: { order: OrderDetail }) {
  if (order.status === "cancelled") {
    const reason = [...order.events].reverse().find((event) => event.message)?.message;
    return (
      <div className="flex items-start gap-3 rounded-lg bg-danger-bg p-4 text-danger" role="status">
        <CircleX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="font-semibold">This order was cancelled.</p>
          {reason ? <p className="text-sm">{reason}</p> : null}
        </div>
      </div>
    );
  }
  if (order.status !== "pending") return null;

  const steps: Record<OrderDetail["paymentMethod"], string> = {
    mpesa_stk: "Complete payment on your phone to confirm it.",
    mpesa_paybill:
      "Pay via M-Pesa Paybill using your order number. We'll confirm your order once we see the payment.",
    pay_on_delivery:
      "We'll call or WhatsApp you to confirm it, then deliver. Pay the rider by M-Pesa or cash when it arrives.",
    pay_on_collection:
      "We'll let you know when it's ready. Pay by M-Pesa or cash when you collect it.",
  };
  const paid = order.paymentStatus === "paid";
  return (
    <div
      className="flex items-start gap-3 rounded-lg bg-success-bg p-4 text-success-fg"
      role="status"
      data-testid="order-next-steps"
    >
      <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Order {order.orderNumber} received.</p>
        <p className="text-sm">
          {paid
            ? "Payment received. We'll confirm your order shortly."
            : steps[order.paymentMethod]}
        </p>
      </div>
    </div>
  );
}

function OrderView({ order, orderRef }: { order: OrderDetail; orderRef: OrderRef }) {
  const queryClient = useQueryClient();
  const whatsappHref = useWhatsappHref(whatsappMessages.orderHelp(order.orderNumber));
  // Keep the M-Pesa panel once it has been shown, so the customer sees "Payment received".
  const [showMpesa] = useState(order.paymentMethod === "mpesa_stk" && order.status === "pending");
  const status = orderStatusLabel(order);
  const payment = paymentStatusLabel(order.paymentStatus);
  const reload = () => void queryClient.invalidateQueries({ queryKey: orderKeys.all() });
  const payableByPaybill =
    order.paymentMethod === "mpesa_paybill" &&
    order.status === "pending" &&
    order.paymentStatus !== "paid";

  return (
    <Container className="flex flex-col gap-6 py-8 sm:py-10" data-print-area>
      <header className="flex flex-col gap-3">
        <p className="text-eyebrow text-forest-800">Order</p>
        <h1 className="font-mono text-h1 tracking-wide text-ink-900">{order.orderNumber}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge label={status.label} tone={status.tone} />
          {order.paymentStatus !== "unpaid" ? (
            <OrderStatusBadge label={payment.label} tone={payment.tone} />
          ) : null}
          <p className="flex items-center gap-1.5 text-sm text-ink-600">
            <Clock aria-hidden="true" className="size-4" />
            Placed <time dateTime={order.placedAt}>{formatDateTime(order.placedAt)}</time>
          </p>
        </div>
      </header>

      <NextSteps order={order} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          {showMpesa && order.status !== "cancelled" ? (
            <MpesaPaymentPanel order={order} orderRef={orderRef} />
          ) : null}
          {payableByPaybill ? (
            <Card title="Pay via M-Pesa Paybill">
              <PaybillInstructions
                orderRef={orderRef}
                totalMinor={order.totalMinor}
                onSubmitted={reload}
              />
            </Card>
          ) : null}
          <OrderItemsCard order={order} />
          <Card title="Order updates">
            <OrderTimeline events={order.events} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <OrderFulfilmentCard order={order} />
          {order.accessToken ? (
            <TrackingLink orderNumber={order.orderNumber} token={order.accessToken} />
          ) : null}
          <section
            aria-label="Help with this order"
            className="flex flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6 print:hidden"
          >
            <h2 className="text-base font-bold text-ink-900">Need help?</h2>
            <p>Quote your order number, {order.orderNumber}, and we'll sort it out.</p>
            <WhatsAppLink
              href={whatsappHref}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            >
              <WhatsAppIcon className="size-4" /> Chat on WhatsApp
            </WhatsAppLink>
            <div className="flex flex-wrap gap-2 border-t border-line pt-3">
              <Button type="button" variant="ghost" size="sm" onClick={() => window.print()}>
                <Printer aria-hidden="true" /> Print receipt
              </Button>
              {isCustomerCancellable(order.status) ? (
                <CancelOrderButton orderRef={orderRef} onCancelled={reload} />
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
