import { ShoppingBag } from "lucide-react";
import type { MouseEvent } from "react";
import { Link, useLocation } from "react-router";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";

import { openCartDrawer } from "../cart-ui.store";
import { selectLineCount, useCartStore } from "../cart.store";

import { loadCartDrawer } from "./cart-drawer-host";

const NO_DRAWER_PATHS = new Set(["/cart", "/checkout"]);

/**
 * Header cart control. A plain link to /cart (works before hydration and without JavaScript);
 * once hydrated, a normal click opens the drawer instead (CART-03). The count appears only after
 * hydration (spike S2), so the pre-rendered HTML and the first client render match.
 */
export function CartLink({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const { pathname } = useLocation();
  const count = useCartStore(selectLineCount);
  const visibleCount = hydrated ? count : 0;
  const label =
    visibleCount === 0
      ? "Cart, empty"
      : `Cart, ${visibleCount} ${visibleCount === 1 ? "item" : "items"}`;

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (!hydrated || modified || event.button !== 0 || NO_DRAWER_PATHS.has(pathname)) return;
    event.preventDefault();
    openCartDrawer();
  }

  return (
    <Link
      to="/cart"
      aria-label={label}
      aria-haspopup="dialog"
      data-testid="cart-link"
      onClick={handleClick}
      onPointerEnter={() => void loadCartDrawer()}
      onFocus={() => void loadCartDrawer()}
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-forest-50",
        className,
      )}
    >
      <ShoppingBag aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {visibleCount > 0 ? (
        <span
          key={visibleCount}
          data-testid="cart-count"
          className="absolute -top-0.5 -right-0.5 grid min-w-5 animate-bump place-items-center rounded-full bg-gold-400 px-1 text-[11px] leading-5 font-bold text-ink-900 tabular-nums"
        >
          {visibleCount > 99 ? "99+" : visibleCount}
        </span>
      ) : null}
    </Link>
  );
}
