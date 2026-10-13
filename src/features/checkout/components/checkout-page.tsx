import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, RotateCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch, type FieldErrors } from "react-hook-form";
import { Link, useNavigate } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatKES } from "@/domain/money";
import { formatKenyanMobile } from "@/domain/phone";
import { paymentMethodAvailability } from "@/domain/payment-methods";
import { accountQueries } from "@/features/account";
import { useSession } from "@/features/auth";
import { CartEmpty, cartKeys, useCartQuote, useCartReady, useCartStore } from "@/features/cart";
import { useSiteSettings } from "@/features/content";
import { deliveryQueries } from "@/features/delivery";
import { randomId } from "@/lib/ids";
import { getServices } from "@/services";
import type { CartQuote } from "@/types/domain";

import { clearCheckoutDraft, readCheckoutDraft, writeCheckoutDraft } from "../checkout-draft";
import {
  EMPTY_CHECKOUT,
  addressFields,
  checkoutSchema,
  fieldId,
  toPlaceOrderInput,
  type CheckoutField,
  type CheckoutValues,
} from "../checkout-form";
import {
  classifyPlaceOrderError,
  needsNewIdempotencyKey,
  type CheckoutProblem,
  type StockFix,
} from "../recovery";

import { CheckoutSection } from "./checkout-section";
import { ErrorSummary } from "./error-summary";
import { FulfilmentFields } from "./fulfilment-fields";
import { OrderSummary } from "./order-summary";
import { PaymentOptions } from "./payment-options";
import { RecoveryScreen, isScreenProblem } from "./recovery-screen";
import { TextAreaField, TextField } from "./text-field";

const FIELD_ORDER = Object.keys(EMPTY_CHECKOUT) as CheckoutField[];

function fieldsWithErrors(errors: FieldErrors<CheckoutValues>): CheckoutField[] {
  return FIELD_ORDER.filter((field) => errors[field]);
}

/** Moves focus to a field after React has rendered it (e.g. once its section reappears). */
function focusFieldSoon(field: CheckoutField) {
  requestAnimationFrame(() => {
    const target = document.getElementById(fieldId(field));
    target?.scrollIntoView({ block: "center" });
    const focusable =
      target instanceof HTMLFieldSetElement
        ? target.querySelector<HTMLInputElement>("input:not(:disabled)")
        : target;
    focusable?.focus({ preventScroll: true });
  });
}

/**
 * Checkout (CHK-01 to CHK-05): contact → delivery or pick-up → payment → review, on one page.
 * Works for guests; signed-in prefill arrives with accounts (P2-10). The cart must have loaded
 * from the device first, and an empty cart has nothing to check out.
 */
export function CheckoutPage() {
  const ready = useCartReady();
  const empty = useCartStore((state) => state.lines.length === 0);

  if (!ready) {
    return (
      <Container
        className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-[minmax(0,1fr)_24rem]"
        aria-busy="true"
      >
        <div className="flex flex-col gap-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <span className="sr-only">Loading checkout…</span>
      </Container>
    );
  }

  if (empty) {
    return (
      <Container className="flex flex-col gap-6 pb-14">
        <h1 className="text-h1 text-ink-900">Checkout</h1>
        <CartEmpty />
      </Container>
    );
  }

  return <CheckoutForm />;
}

function CheckoutForm() {
  const settings = useSiteSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lines = useCartStore((state) => state.lines);
  const promoCode = useCartStore((state) => state.promoCode);
  const savedAreaId = useCartStore((state) => state.deliveryAreaId);
  const { setQuantity, removeItem, updateSnapshot, setPromoCode, clear } = useCartStore.getState();

  const [initial] = useState(readCheckoutDraft);
  const keyRef = useRef(initial.idempotencyKey);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: initial.values,
    mode: "onTouched",
    // The error summary takes focus instead and links to each field (DESIGN_SYSTEM.md §11).
    shouldFocusError: false,
  });
  const { control, register, setValue, getValues, setError, subscribe, formState } = form;
  const [fulfilment, deliveryAreaId, pickupLocationId, paymentMethod] = useWatch({
    control,
    name: ["fulfilment", "deliveryAreaId", "pickupLocationId", "paymentMethod"],
  });

  // Failed attempts so far: the error summary appears after the first and takes focus on each.
  const [attempt, setAttempt] = useState(0);
  const [problem, setProblem] = useState<CheckoutProblem | null>(null);
  const [seenQuote, setSeenQuote] = useState<CartQuote | undefined>(undefined);

  const areas = useQuery(deliveryQueries.areas());
  const pickups = useQuery(deliveryQueries.pickups());
  const session = useSession();
  const signedIn = session.status === "ready" && session.session !== null;
  const profile = useQuery({ ...accountQueries.profile(), enabled: signedIn });
  const savedAddresses = useQuery({ ...accountQueries.addresses(), enabled: signedIn });
  const quote = useCartQuote({
    fulfilment,
    deliveryAreaId: fulfilment === "delivery" ? deliveryAreaId || null : null,
    pickupLocationId: fulfilment === "collection" ? pickupLocationId || null : null,
    promoCode,
  });
  const collectionOnly = quote.data?.lines.some((line) => line.collectionOnly) ?? false;
  const paymentOptions = paymentMethodAvailability(
    settings.payments,
    fulfilment,
    quote.data?.totalMinor ?? null,
  );
  const firstAvailable = paymentOptions.find((option) => option.available)?.method ?? "";
  const selectedAvailable = paymentOptions.some(
    (option) => option.method === paymentMethod && option.available,
  );

  // Keep the draft in sessionStorage as the customer types (CHK-03).
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => writeCheckoutDraft({ values, idempotencyKey: keyRef.current }),
      }),
    [subscribe],
  );

  // Start from the area chosen for the cart's delivery estimate, if the draft has none.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !areas.data) return;
    prefilled.current = true;
    const area = areas.data.find((a) => a.id === savedAreaId);
    if (area && !getValues("deliveryAreaId")) {
      setValue("county", area.county);
      setValue("deliveryAreaId", area.id);
      if (!getValues("town")) setValue("town", area.name);
    }
  }, [areas.data, savedAreaId, getValues, setValue]);

  // CHK-01: signed-in customers start from their profile and default address. Nothing the
  // customer typed (or kept in the draft) is overwritten.
  const accountPrefilled = useRef(false);
  useEffect(() => {
    if (accountPrefilled.current || !profile.data || !savedAddresses.data || !areas.data) return;
    accountPrefilled.current = true;
    const fill = (name: CheckoutField, value: string) => {
      if (value && !getValues(name).trim()) setValue(name, value as never);
    };
    fill("name", profile.data.fullName);
    fill("phone", profile.data.phone ? formatKenyanMobile(profile.data.phone) : "");
    fill("email", profile.data.email);
    const address = savedAddresses.data.find(
      (a) => a.isDefault && areas.data.some((area) => area.id === a.deliveryAreaId),
    );
    const area = getValues("deliveryAreaId");
    if (address && !getValues("addressLine").trim() && (!area || area === address.deliveryAreaId)) {
      for (const [name, value] of Object.entries(addressFields(address))) {
        setValue(name as CheckoutField, value as never);
      }
    }
  }, [profile.data, savedAddresses.data, areas.data, getValues, setValue]);

  // BR-14: an order with a pick-up-only item can't be delivered.
  useEffect(() => {
    if (collectionOnly && fulfilment === "delivery") setValue("fulfilment", "collection");
  }, [collectionOnly, fulfilment, setValue]);

  // CHK-04: never leave a method selected that this order can't use.
  useEffect(() => {
    if (!selectedAvailable && paymentMethod !== firstAvailable) {
      setValue("paymentMethod", firstAvailable, { shouldValidate: formState.isSubmitted });
    }
  }, [selectedAvailable, paymentMethod, firstAvailable, setValue, formState.isSubmitted]);

  const place = useMutation({
    mutationFn: async ({
      values,
      expectedTotalMinor,
    }: {
      values: CheckoutValues;
      expectedTotalMinor: number;
    }) => {
      const idempotencyKey = keyRef.current ?? randomId();
      keyRef.current = idempotencyKey;
      writeCheckoutDraft({ values, idempotencyKey });
      const input = toPlaceOrderInput(values, {
        items: lines.map((line) => ({ variantId: line.variantId, quantity: line.quantity })),
        promoCode,
        expectedTotalMinor,
        idempotencyKey,
      });
      const { orders, payments } = getServices();
      const placed = await orders.placeOrder(input);
      if (placed.nextAction === "mpesa_stk") {
        // Send the prompt straight away (API_AND_INTEGRATIONS.md §7.6). If it fails, the order
        // page shows why and offers to send it again.
        await payments
          .startMpesaPayment({
            orderNumber: placed.orderNumber,
            token: placed.accessToken,
            phone: input.customer.phone,
            idempotencyKey: randomId(),
          })
          .catch(() => undefined);
      }
      return placed;
    },
    onSuccess: async (placed) => {
      await navigate(placed.trackingPath, { replace: true });
      clear();
      clearCheckoutDraft();
    },
    onError: (error) => {
      if (needsNewIdempotencyKey(error)) {
        keyRef.current = null;
        writeCheckoutDraft({ values: getValues(), idempotencyKey: null });
      }
      void queryClient.invalidateQueries({ queryKey: cartKeys.quotes() });
      const next = classifyPlaceOrderError(error);
      if (next.kind === "fields") {
        for (const [field, message] of Object.entries(next.fields)) {
          setError(field as CheckoutField, { type: "server", message });
        }
        setAttempt((count) => count + 1);
        setProblem(null);
        return;
      }
      setProblem(next);
    },
  });

  const submit = form.handleSubmit(
    (values) => {
      if (!quote.data) return;
      setProblem(null);
      setSeenQuote(quote.data);
      place.mutate({ values, expectedTotalMinor: quote.data.totalMinor });
    },
    () => setAttempt((count) => count + 1),
  );

  function placeAtTotal(next: CartQuote) {
    // The customer accepted the new prices: the cart shows them from now on.
    for (const line of next.lines) {
      updateSnapshot(line.variantId, { unitPriceMinor: line.unitPriceMinor });
    }
    setSeenQuote(next);
    place.mutate({ values: getValues(), expectedTotalMinor: next.totalMinor });
  }

  function applyFixes(fixes: StockFix[]) {
    for (const fix of fixes) {
      if (fix.to === null) removeItem(fix.variantId);
      else setQuantity(fix.variantId, fix.to);
    }
    setProblem(null);
    window.scrollTo({ top: 0 });
  }

  function chooseCollection() {
    setValue("fulfilment", "collection", { shouldDirty: true });
    setProblem(null);
    focusFieldSoon("pickupLocationId");
  }

  function chooseAnotherArea() {
    setValue("deliveryAreaId", "", { shouldDirty: true });
    setProblem(null);
    focusFieldSoon("deliveryAreaId");
  }

  const updating = !quote.data || quote.isPlaceholderData;
  const errors = formState.errors;
  const areaName = areas.data?.find((area) => area.id === deliveryAreaId)?.name ?? null;

  return (
    <Container className="pb-12 sm:pb-16">
      <h1 className="text-h1 text-ink-900">Checkout</h1>
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10">
        <OrderSummary
          quote={quote.data}
          pending={quote.isFetching}
          className="lg:col-start-2 lg:row-start-1"
        />

        <div className="flex min-w-0 flex-col gap-6 lg:col-start-1 lg:row-start-1">
          {isScreenProblem(problem) ? (
            <RecoveryScreen
              problem={problem}
              previousQuote={seenQuote}
              areaName={areaName}
              placing={place.isPending}
              onPlaceAtTotal={placeAtTotal}
              onApplyFixes={applyFixes}
              onChooseCollection={chooseCollection}
              onChooseAnotherArea={chooseAnotherArea}
            />
          ) : (
            <FormProvider {...form}>
              <form
                noValidate
                onSubmit={submit}
                className="flex flex-col gap-6"
                aria-label="Checkout"
              >
                <ErrorSummary
                  fields={attempt > 0 ? fieldsWithErrors(errors) : []}
                  focusKey={attempt}
                />

                <CheckoutSection id="checkout-contact" step={1} title="Your details">
                  <TextField
                    {...register("name")}
                    label="Full name"
                    autoComplete="name"
                    error={errors.name?.message}
                  />
                  <TextField
                    {...register("phone")}
                    label="Phone number"
                    hint="For M-Pesa and order updates, e.g. 0712 345 678."
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    error={errors.phone?.message}
                  />
                  <TextField
                    {...register("email")}
                    label="Email"
                    hint="We'll send your receipt here."
                    type="email"
                    autoComplete="email"
                    optional
                    error={errors.email?.message}
                  />
                </CheckoutSection>

                <CheckoutSection id="checkout-fulfilment" step={2} title="Delivery or pick-up">
                  {areas.data && pickups.data ? (
                    <FulfilmentFields
                      areas={areas.data}
                      pickups={pickups.data}
                      quote={quote.data}
                      collectionOnly={collectionOnly}
                      savedAddresses={savedAddresses.data}
                    />
                  ) : areas.isError || pickups.isError ? (
                    <div
                      className="flex flex-col items-start gap-3 text-sm text-ink-700"
                      role="alert"
                    >
                      <p>Delivery options couldn't load. Check your connection and try again.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          void areas.refetch();
                          void pickups.refetch();
                        }}
                      >
                        <RotateCw aria-hidden="true" /> Try again
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3" aria-busy="true">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-11 w-full" />
                      <span className="sr-only">Loading delivery options…</span>
                    </div>
                  )}
                </CheckoutSection>

                <CheckoutSection id="checkout-payment" step={3} title="Payment">
                  <PaymentOptions options={paymentOptions} settings={settings.payments} />
                </CheckoutSection>

                <CheckoutSection id="checkout-review" step={4} title="Review and place your order">
                  <TextAreaField
                    {...register("note")}
                    label="Order note"
                    hint="Anything we should know about your order?"
                    optional
                    rows={2}
                    error={errors.note?.message}
                  />
                  <p className="flex items-baseline justify-between gap-4 border-t border-line pt-4 text-lg font-bold text-ink-900">
                    <span>Total</span>
                    <span data-tabular data-testid="checkout-total">
                      {quote.data ? formatKES(quote.data.totalMinor) : "…"}
                    </span>
                  </p>
                  {problem ? (
                    <ProblemAlert
                      problem={problem}
                      onRemovePromo={() => {
                        setPromoCode(null);
                        setProblem(null);
                      }}
                      onChooseCollection={chooseCollection}
                    />
                  ) : null}
                  {quote.isError && !quote.data ? (
                    <p className="text-sm text-danger" role="alert">
                      We couldn't work out your total. Check your connection; we'll keep trying.
                    </p>
                  ) : null}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-fit"
                    loading={place.isPending}
                    disabled={updating}
                    data-testid="place-order"
                  >
                    {place.isPending
                      ? "Placing your order…"
                      : updating
                        ? "Updating your total…"
                        : paymentMethod === "mpesa_stk"
                          ? "Place order and pay with M-Pesa"
                          : "Place order"}
                  </Button>
                  <p className="flex items-start gap-2 text-xs text-ink-600">
                    <LockKeyhole aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      By placing your order you agree to our{" "}
                      <Link to="/policies/terms" className="underline underline-offset-2">
                        terms
                      </Link>{" "}
                      and{" "}
                      <Link to="/policies/privacy" className="underline underline-offset-2">
                        privacy policy
                      </Link>
                      .
                    </span>
                  </p>
                </CheckoutSection>
              </form>
            </FormProvider>
          )}
        </div>
      </div>
    </Container>
  );
}

/** Problems that don't need a screen of their own, shown beside the button. */
function ProblemAlert({
  problem,
  onRemovePromo,
  onChooseCollection,
}: {
  problem: CheckoutProblem;
  onRemovePromo: () => void;
  onChooseCollection: () => void;
}) {
  if (problem.kind !== "promo" && problem.kind !== "minimum_order" && problem.kind !== "alert") {
    return null;
  }
  return (
    <div
      role="alert"
      data-testid="checkout-alert"
      className="flex flex-col gap-3 rounded-md bg-danger-bg p-4 text-sm text-danger"
    >
      <p>{problem.message}</p>
      {problem.kind === "alert" ? (
        <p className="text-ink-700">Your details are saved on this device. Please try again.</p>
      ) : null}
      {problem.kind === "promo" ? (
        <Button type="button" variant="outline" size="sm" className="w-fit" onClick={onRemovePromo}>
          Remove the code
        </Button>
      ) : null}
      {problem.kind === "minimum_order" ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={onChooseCollection}
        >
          Choose pick-up instead
        </Button>
      ) : null}
    </div>
  );
}
