import { CircleAlert, PackageX, Store, Tag } from "lucide-react";
import { useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { Link } from "react-router";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { WhatsAppLink } from "@/components/shared/whatsapp-link";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatKES } from "@/domain/money";
import { formatQuantity, unitLabel } from "@/domain/units";
import { useWhatsappHref } from "@/features/content";
import type { CartQuote } from "@/types/domain";

import { priceChanges, stockFixes, type CheckoutProblem, type StockFix } from "../recovery";

type ScreenProblem = Extract<
  CheckoutProblem,
  { kind: "price_changed" | "stock" | "area_not_served" | "too_many_open_orders" }
>;

export function isScreenProblem(problem: CheckoutProblem | null): problem is ScreenProblem {
  return (
    problem !== null &&
    (problem.kind === "price_changed" ||
      problem.kind === "stock" ||
      problem.kind === "area_not_served" ||
      problem.kind === "too_many_open_orders")
  );
}

function Screen({
  icon: Icon,
  title,
  children,
  actions,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.scrollIntoView({ block: "center" });
    heading.current?.focus({ preventScroll: true });
  }, []);
  return (
    <section
      aria-labelledby="recovery-heading"
      data-testid="checkout-recovery"
      className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-warning-bg text-warning-fg">
          <Icon aria-hidden className="size-5" />
        </span>
        <h2
          id="recovery-heading"
          ref={heading}
          tabIndex={-1}
          className="pt-1.5 text-h3 text-ink-900 outline-none"
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-col gap-3 text-ink-700">{children}</div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">{actions}</div>
    </section>
  );
}

function fixText(fix: StockFix): string {
  return fix.to === null
    ? "Remove: none left to order"
    : `Change ${formatQuantity(fix.from, fix.unit)} to ${formatQuantity(fix.to, fix.unit)}`;
}

/**
 * Full recovery screens for an order the server declined (CHK-05): the customer sees exactly what
 * changed and chooses what to do. Nothing is changed for them without a tap.
 */
export function RecoveryScreen({
  problem,
  previousQuote,
  areaName,
  placing,
  onPlaceAtTotal,
  onApplyFixes,
  onChooseCollection,
  onChooseAnotherArea,
}: {
  problem: ScreenProblem;
  /** The quote the customer saw before placing the order. */
  previousQuote: CartQuote | undefined;
  areaName: string | null;
  placing: boolean;
  onPlaceAtTotal: (quote: CartQuote) => void;
  onApplyFixes: (fixes: StockFix[]) => void;
  onChooseCollection: () => void;
  onChooseAnotherArea: () => void;
}) {
  const whatsappHref = useWhatsappHref();
  const backToCart = (
    <Link to="/cart" className={buttonVariants({ variant: "outline" })}>
      Back to cart
    </Link>
  );
  const whatsapp = (
    <WhatsAppLink href={whatsappHref} className={buttonVariants({ variant: "outline" })}>
      <WhatsAppIcon className="size-5" /> Chat on WhatsApp
    </WhatsAppLink>
  );

  switch (problem.kind) {
    case "price_changed": {
      const changes = priceChanges(previousQuote, problem.quote);
      return (
        <Screen
          icon={Tag}
          title="Some prices changed"
          actions={
            <>
              <Button
                size="lg"
                loading={placing}
                onClick={() => onPlaceAtTotal(problem.quote)}
                data-testid="place-at-new-total"
              >
                Place order for {formatKES(problem.quote.totalMinor)}
              </Button>
              {backToCart}
            </>
          }
        >
          <p>Prices changed since you opened checkout. Please check them before you order.</p>
          {changes.length > 0 ? (
            <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
              {changes.map((change) => (
                <li key={change.variantId} className="flex flex-wrap justify-between gap-2 p-3">
                  <span className="font-medium text-ink-900">{change.name}</span>
                  <span data-tabular>
                    <s className="text-ink-600">{formatKES(change.fromMinor)}</s>{" "}
                    <span className="font-semibold text-ink-900">
                      {formatKES(change.toMinor)} / {unitLabel(change.unit)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            New total:{" "}
            <strong className="text-ink-900" data-tabular>
              {formatKES(problem.quote.totalMinor)}
            </strong>
            {previousQuote ? (
              <>
                {" "}
                (was <span data-tabular>{formatKES(previousQuote.totalMinor)}</span>)
              </>
            ) : null}
          </p>
        </Screen>
      );
    }

    case "stock": {
      const fixes = stockFixes(problem.quote);
      return (
        <Screen
          icon={PackageX}
          title="Some items have changed"
          actions={
            <>
              <Button size="lg" onClick={() => onApplyFixes(fixes)} data-testid="apply-stock-fixes">
                Update my order
              </Button>
              {backToCart}
            </>
          }
        >
          <p>
            Some items sold out or don't have enough stock left. Update your order to continue, or
            go back to your cart.
          </p>
          <ul className="flex flex-col divide-y divide-line rounded-md border border-line">
            {fixes.map((fix) => (
              <li key={fix.variantId} className="flex flex-col gap-0.5 p-3">
                <span className="font-medium text-ink-900">{fix.name}</span>
                <span className="text-sm">{fixText(fix)}</span>
              </li>
            ))}
          </ul>
        </Screen>
      );
    }

    case "area_not_served":
      return (
        <Screen
          icon={Store}
          title={
            areaName
              ? `We don't deliver to ${areaName} any more`
              : "We don't deliver there any more"
          }
          actions={
            <>
              <Button size="lg" onClick={onChooseCollection}>
                Choose pick-up instead
              </Button>
              <Button size="lg" variant="outline" onClick={onChooseAnotherArea}>
                Choose another area
              </Button>
              {whatsapp}
            </>
          }
        >
          <p>
            Delivery to this area stopped after you opened checkout. You can collect your order from
            a pick-up point for free, choose another area, or ask us on WhatsApp.
          </p>
        </Screen>
      );

    case "too_many_open_orders":
      return (
        <Screen
          icon={CircleAlert}
          title="You have unpaid orders waiting"
          actions={
            <>
              <Link to="/track-order" className={buttonVariants({ size: "lg" })}>
                Track an order
              </Link>
              {whatsapp}
            </>
          }
        >
          <p>
            This phone number already has orders waiting for payment. Pay for or cancel one of them
            first, using the link we gave you when you placed it. If you need help, chat with us.
          </p>
        </Screen>
      );
  }
}
