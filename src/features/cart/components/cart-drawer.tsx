import { ArrowRight, RotateCw } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { errorMessage } from "@/lib/errors";

import { setCartDrawerOpen, useCartUi } from "../cart-ui.store";
import { useCartStore } from "../cart.store";
import { hasBlockingLineIssues, useCartQuote } from "../use-cart-quote";

import { CartEmpty } from "./cart-empty";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

/**
 * Quick-look cart drawer (CART-03). Loaded on first open, so its code is never in a page's initial
 * JavaScript (NFR-PERF-3). The full cart page has the same lines with more room.
 */
export default function CartDrawer() {
  const open = useCartUi((state) => state.drawerOpen);
  const lines = useCartStore((state) => state.lines);
  const quote = useCartQuote();
  const close = () => setCartDrawerOpen(false);
  const hasBlockingIssue = hasBlockingLineIssues(quote.data);

  return (
    <Sheet open={open} onOpenChange={setCartDrawerOpen}>
      <SheetContent
        side="right"
        className="flex w-[min(26rem,100vw)] flex-col gap-0 bg-white p-0"
        data-testid="cart-drawer"
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle className="text-h3">
            Your cart{lines.length > 0 ? ` (${lines.length})` : ""}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Items in your cart, with prices checked against current stock.
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 items-center p-5">
            <CartEmpty onNavigate={close} className="w-full shadow-none" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {quote.isError ? (
                <div
                  role="alert"
                  className="mt-4 flex flex-col gap-2 rounded-md bg-danger-bg p-3 text-sm text-danger"
                >
                  <p>{errorMessage(quote.error)} Your cart is saved on this device.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-fit"
                    onClick={() => void quote.refetch()}
                  >
                    <RotateCw aria-hidden="true" /> Try again
                  </Button>
                </div>
              ) : null}
              <ul className="divide-y divide-line">
                {lines.map((line) => (
                  <CartLineItem
                    key={line.variantId}
                    line={line}
                    quoteLine={quote.data?.lines.find((q) => q.variantId === line.variantId)}
                    quoteLoading={quote.isFetching}
                    onNavigate={close}
                  />
                ))}
              </ul>
            </div>
            <SheetFooter className="gap-4 border-t border-line bg-cream-50 px-5 py-4">
              <CartSummary quote={quote.data} itemCount={lines.length} pending={quote.isFetching} />
              {hasBlockingIssue ? (
                <p className="text-sm text-warning-fg">Fix the highlighted items to check out.</p>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link to="/cart" onClick={close}>
                    View cart
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/checkout" onClick={close} data-testid="drawer-checkout">
                    Checkout <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
