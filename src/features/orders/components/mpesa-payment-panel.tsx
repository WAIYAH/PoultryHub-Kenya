import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CircleCheck, CircleX, LoaderCircle, ShieldCheck, Smartphone } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { formatKES } from "@/domain/money";
import { formatKenyanMobile, normalizeKenyanMobile } from "@/domain/phone";
import { useSiteSettings } from "@/features/content";
import { errorCopy, errorMessage, isAppError } from "@/lib/errors";
import { randomId } from "@/lib/ids";
import { getServices } from "@/services";
import type { OrderDetail, OrderRef } from "@/types/domain";

import { orderKeys, orderQueries, paymentPollInterval } from "../queries";
import { formatCountdown, useNow } from "../use-now";

import { MockPaymentControls, mockPaymentsAvailable } from "./mock-payment-controls";
import { PaybillInstructions } from "./paybill-instructions";

type PanelState = "ready" | "waiting" | "failed" | "paid";

/**
 * Pay with M-Pesa (PAY-01, PAY-02, DESIGN_SYSTEM.md §9.3 MpesaPaymentPanel): ready → sending →
 * waiting for the PIN (with the payment window counting down) → paid, cancelled, failed or timed
 * out, with "try again", a changeable number and Paybill as a fallback. The amount always comes
 * from the server. Status is polled (ARCHITECTURE.md §7.2); a browser signal never marks it paid.
 */
export function MpesaPaymentPanel({ order, orderRef }: { order: OrderDetail; orderRef: OrderRef }) {
  const id = useId();
  const settings = useSiteSettings();
  const queryClient = useQueryClient();
  const payment = useQuery(orderQueries.payment(orderRef));
  const [phone, setPhone] = useState(() => formatKenyanMobile(order.customerPhone));
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showPaybill, setShowPaybill] = useState(false);

  const latest = payment.data?.latestAttempt ?? null;
  const paid = order.paymentStatus === "paid" || payment.data?.paymentStatus === "paid";
  const state: PanelState = paid
    ? "paid"
    : latest?.status === "pending"
      ? "waiting"
      : latest && latest.status !== "succeeded"
        ? "failed"
        : "ready";
  const reservedUntil = payment.data?.reservedUntil ?? order.reservedUntil;
  const now = useNow(state !== "paid" && reservedUntil !== null);
  const remaining = reservedUntil ? Date.parse(reservedUntil) - now : null;
  const pollingStopped = state === "waiting" && paymentPollInterval(payment.data, now) === false;

  const refresh = useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.payment(orderRef) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderRef) }),
      ]),
    [queryClient, orderRef],
  );

  // When the payment's outcome changes, reload the order for its status and timeline.
  const outcome = payment.data
    ? `${payment.data.status}:${payment.data.paymentStatus}:${latest?.status ?? "none"}`
    : null;
  const lastOutcome = useRef<string | null>(null);
  useEffect(() => {
    if (lastOutcome.current !== null && outcome !== lastOutcome.current) {
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderRef) });
    }
    lastOutcome.current = outcome;
  }, [outcome, queryClient, orderRef]);

  // The hold ran out: the server cancels the order (BR-09); show that.
  const expired = remaining !== null && remaining <= 0;
  useEffect(() => {
    if (expired) void refresh();
  }, [expired, refresh]);

  const send = useMutation({
    mutationFn: (e164: string) =>
      getServices().payments.startMpesaPayment({
        ...orderRef,
        phone: e164,
        idempotencyKey: randomId(),
      }),
    onSuccess: () => void refresh(),
    onError: (error) => {
      if (isAppError(error, "INVALID_PHONE")) setPhoneError(error.message);
      if (isAppError(error, "PAYMENT_IN_PROGRESS") || isAppError(error, "ORDER_NOT_PAYABLE")) {
        void refresh();
      }
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const e164 = normalizeKenyanMobile(phone);
    if (!e164) {
      setPhoneError(errorCopy("INVALID_PHONE"));
      return;
    }
    setPhoneError(null);
    send.mutate(e164);
  }

  const sendError =
    send.isError && !isAppError(send.error, "INVALID_PHONE") ? errorMessage(send.error) : null;
  const amount = formatKES(order.totalMinor);
  const receipt = order.payments.find((p) => p.status === "succeeded")?.receipt ?? null;

  return (
    <section
      aria-labelledby={`${id}-heading`}
      data-testid="mpesa-panel"
      data-state={state}
      className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6 print:hidden"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id={`${id}-heading`} className="text-h3 text-ink-900">
          Pay with M-Pesa
        </h2>
        <p className="text-lg font-bold text-ink-900" data-tabular>
          {amount}
        </p>
      </div>

      <div aria-live="polite" className="flex flex-col gap-4">
        {state === "paid" ? (
          <div className="flex items-start gap-3 rounded-md bg-success-bg p-4 text-success-fg">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">Payment received. Thank you!</p>
              {receipt ? (
                <p className="text-sm">
                  M-Pesa receipt <span className="font-mono">{receipt}</span>
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {state === "waiting" ? (
          <div className="flex items-start gap-3 rounded-md bg-forest-50 p-4 text-forest-900">
            <Smartphone aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold">
                Check your phone: enter your M-Pesa PIN to pay {amount} to {settings.businessName}.
              </p>
              <p className="flex items-center gap-2 text-sm">
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                Waiting for your payment…
              </p>
              <p className="text-sm text-ink-700">
                No prompt? Make sure your phone is on and unlocked. You can send a new one if this
                one fails or you cancel it.
              </p>
            </div>
          </div>
        ) : null}

        {state === "failed" && latest?.resultMessage ? (
          <div
            className="flex items-start gap-3 rounded-md bg-danger-bg p-4 text-danger"
            role="alert"
          >
            <CircleX aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p>{latest.resultMessage}</p>
          </div>
        ) : null}
      </div>

      {pollingStopped ? (
        <div className="flex flex-col items-start gap-2 text-sm text-ink-700">
          <p>Still waiting for M-Pesa. If you've paid, check again.</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refresh()}>
            Check again
          </Button>
        </div>
      ) : null}

      {state === "ready" || state === "failed" ? (
        <form onSubmit={submit} noValidate className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-phone`} className="text-sm font-medium text-ink-900">
              M-Pesa phone number
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              aria-invalid={phoneError ? true : undefined}
              aria-describedby={phoneError ? `${id}-phone-error` : undefined}
              className="h-11 w-full max-w-xs rounded-md border border-input bg-white px-3 text-base text-ink-900 focus-visible:border-ring aria-invalid:border-destructive"
            />
            {phoneError ? (
              <p id={`${id}-phone-error`} className="text-sm text-danger">
                {phoneError}
              </p>
            ) : null}
          </div>
          {sendError ? (
            <p className="text-sm text-danger" role="alert">
              {sendError}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-fit"
            loading={send.isPending}
            data-testid="send-mpesa-prompt"
          >
            {send.isPending ? "Sending…" : state === "failed" ? "Try again" : "Send payment prompt"}
          </Button>
        </form>
      ) : null}

      {state !== "paid" && remaining !== null && remaining > 0 ? (
        <p className="text-sm text-ink-700" data-testid="payment-window">
          We're holding your items for{" "}
          <span className="font-semibold text-ink-900" data-tabular>
            {formatCountdown(remaining)}
          </span>
          . Unpaid orders are cancelled after that.
        </p>
      ) : null}

      {state === "waiting" && latest && mockPaymentsAvailable() ? (
        <MockPaymentControls paymentId={latest.id} onDone={() => void refresh()} />
      ) : null}

      {state !== "paid" && settings.payments.mpesaPaybill ? (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <button
            type="button"
            aria-expanded={showPaybill}
            onClick={() => setShowPaybill((value) => !value)}
            className="w-fit text-sm font-semibold text-forest-700 underline underline-offset-4"
          >
            {showPaybill ? "Hide Paybill instructions" : "Pay via Paybill instead"}
          </button>
          {showPaybill ? (
            <PaybillInstructions
              orderRef={orderRef}
              totalMinor={order.totalMinor}
              onSubmitted={() => void refresh()}
            />
          ) : null}
        </div>
      ) : null}

      <p className="flex items-start gap-2 text-sm font-medium text-ink-900">
        <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-forest-700" />
        We will never ask for your M-Pesa PIN by call or SMS.
      </p>
    </section>
  );
}
