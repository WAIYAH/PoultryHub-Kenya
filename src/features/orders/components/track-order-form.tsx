import { PackageSearch, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { normalizeOrderNumber, orderStatusLabel } from "@/domain/order-status";
import { normalizeKenyanMobile } from "@/domain/phone";
import { errorCopy, errorMessage } from "@/lib/errors";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { getServices } from "@/services";
import type { OrderTracking } from "@/types/domain";

import { OrderStatusBadge } from "./order-status-badge";
import { OrderTimeline } from "./order-timeline";

type Lookup =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "found"; tracking: OrderTracking }
  | { state: "not_found" }
  | { state: "error"; message: string };

const input =
  "h-11 w-full rounded-md border border-input bg-white px-3 text-base text-ink-900 focus-visible:border-ring aria-invalid:border-destructive";

/**
 * Track an order by number and phone (CHK-07, BR-28). It shows the status and timeline only,
 * never personal data, and the same "not found" for any mismatch. Native controls keep this
 * pre-rendered page light (NFR-PERF-3).
 */
export function TrackOrderForm() {
  const id = useId();
  const result = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const [searchParams] = useSearchParams();
  // The order page's "not found" links here with ?order= filled in. Pre-rendered without a query
  // string, so it applies after hydration (ARCHITECTURE.md §4), until the customer types.
  const [typedNumber, setOrderNumber] = useState<string | null>(null);
  const orderNumber = typedNumber ?? (hydrated ? (searchParams.get("order") ?? "") : "");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ orderNumber?: string; phone?: string }>({});
  const [lookup, setLookup] = useState<Lookup>({ state: "idle" });

  useEffect(() => {
    if (lookup.state === "found" || lookup.state === "not_found") result.current?.focus();
  }, [lookup.state]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const number = normalizeOrderNumber(orderNumber);
    const e164 = normalizeKenyanMobile(phone);
    const next = {
      orderNumber: number ? undefined : "Enter your order number, e.g. PH001234.",
      phone: e164 ? undefined : errorCopy("INVALID_PHONE"),
    };
    setErrors(next);
    if (!number || !e164) return;
    setLookup({ state: "loading" });
    try {
      const tracking = await getServices().orders.trackOrder({ orderNumber: number, phone: e164 });
      setLookup(tracking ? { state: "found", tracking } : { state: "not_found" });
    } catch (error) {
      setLookup({ state: "error", message: errorMessage(error) });
    }
  }

  const status = lookup.state === "found" ? orderStatusLabel(lookup.tracking) : null;

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(event) => void submit(event)}
        noValidate
        aria-label="Track an order"
        className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-number`} className="text-sm font-medium text-ink-900">
              Order number
            </label>
            <input
              id={`${id}-number`}
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value.toUpperCase())}
              placeholder="PH001234"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-invalid={errors.orderNumber ? true : undefined}
              aria-describedby={errors.orderNumber ? `${id}-number-error` : undefined}
              className={`${input} font-mono tracking-wide placeholder:font-sans`}
            />
            {errors.orderNumber ? (
              <p id={`${id}-number-error`} className="text-sm text-danger">
                {errors.orderNumber}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-phone`} className="text-sm font-medium text-ink-900">
              Phone number used for the order
            </label>
            <input
              id={`${id}-phone`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0712 345 678"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? `${id}-phone-error` : undefined}
              className={input}
            />
            {errors.phone ? (
              <p id={`${id}-phone-error`} className="text-sm text-danger">
                {errors.phone}
              </p>
            ) : null}
          </div>
        </div>
        <Button type="submit" className="w-full sm:w-fit" loading={lookup.state === "loading"}>
          <Search aria-hidden="true" /> Find my order
        </Button>
        {lookup.state === "error" ? (
          <p className="text-sm text-danger" role="alert">
            {lookup.message}
          </p>
        ) : null}
      </form>

      <div ref={result} tabIndex={-1} className="outline-none" aria-live="polite">
        {lookup.state === "not_found" ? (
          <div
            className="flex items-start gap-3 rounded-lg bg-white p-5 shadow-card sm:p-6"
            data-testid="track-not-found"
          >
            <PackageSearch aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-ink-600" />
            <div className="flex flex-col gap-1 text-sm text-ink-700">
              <h2 className="text-base font-bold text-ink-900">No order found</h2>
              <p>
                We couldn't find an order with that number and phone. Check both, and use the phone
                number you gave when ordering.
              </p>
            </div>
          </div>
        ) : null}
        {lookup.state === "found" && status ? (
          <section
            aria-labelledby={`${id}-result`}
            className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
            data-testid="track-result"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={`${id}-result`} className="font-mono text-h3 tracking-wide text-ink-900">
                {lookup.tracking.orderNumber}
              </h2>
              <OrderStatusBadge label={status.label} tone={status.tone} />
            </div>
            <OrderTimeline events={lookup.tracking.events} />
            <p className="text-sm text-ink-600">
              For the full details and payment, open the link from your order confirmation.
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
