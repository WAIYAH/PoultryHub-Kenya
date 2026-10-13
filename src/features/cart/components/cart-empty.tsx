import { ShoppingBag } from "lucide-react";
import { Link } from "react-router";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { footerNav } from "@/config/site";

/** Empty cart (CART-07, DESIGN_SYSTEM.md §11), with the shop categories as next steps. */
export function CartEmpty({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const categories = footerNav.shop.links.filter((link) => link.href !== "/shop");
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your cart is empty"
      description="Fresh eggs, chicks and more are a tap away."
      className={className}
      actions={
        <div className="flex flex-col items-center gap-4">
          <Button asChild>
            <Link to="/shop" onClick={onNavigate}>
              Browse all products
            </Link>
          </Button>
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Shop by category">
            {categories.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={onNavigate}
                  className="inline-flex min-h-10 items-center rounded-full border border-line bg-white px-4 text-sm font-semibold text-forest-900 hover:bg-forest-50"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      }
    />
  );
}
