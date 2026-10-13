import { ShoppingBag } from "lucide-react";
import { Link } from "react-router";

import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils";

import { selectLineCount, useCartStore } from "../cart.store";

/** Header cart link. The count only appears after hydration (spike S2), so HTML and client match. */
export function CartLink({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const count = useCartStore(selectLineCount);
  const visibleCount = hydrated ? count : 0;
  const label =
    visibleCount === 0
      ? "Cart, empty"
      : `Cart, ${visibleCount} ${visibleCount === 1 ? "item" : "items"}`;

  return (
    <Link
      to="/cart"
      aria-label={label}
      data-testid="cart-link"
      className={cn(
        "relative inline-flex size-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-forest-50",
        className,
      )}
    >
      <ShoppingBag aria-hidden="true" className="size-5" strokeWidth={1.75} />
      {visibleCount > 0 ? (
        <span
          data-testid="cart-count"
          className="absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[11px] leading-5 font-bold text-ink-900 tabular-nums"
        >
          {visibleCount > 99 ? "99+" : visibleCount}
        </span>
      ) : null}
    </Link>
  );
}
