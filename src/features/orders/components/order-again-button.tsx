import { RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { thumbnailSrc, useCartStore } from "@/features/cart";
import { notifySuccess } from "@/lib/notify";
import type { OrderItem } from "@/types/domain";

/**
 * Order again (CART-08): adds the order's items to the cart, then opens it. The cart's server
 * quote re-checks every price, stock level and quantity rule, and flags anything that changed.
 * Items whose product no longer exists are left out.
 */
export function OrderAgainButton({ items }: { items: OrderItem[] }) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const available = items.filter(
    (item): item is OrderItem & { variantId: string; productSlug: string } =>
      item.variantId !== null && item.productSlug !== null,
  );
  if (available.length === 0) return null;

  function orderAgain() {
    for (const item of available) {
      addItem({
        variantId: item.variantId,
        quantity: item.quantity,
        snapshot: {
          productSlug: item.productSlug,
          productName: item.productName,
          variantName: item.variantName,
          unit: item.unit,
          unitPriceMinor: item.unitPriceMinor,
          imageSrc: thumbnailSrc(item.image),
        },
      });
    }
    notifySuccess(
      `Added ${available.length} ${available.length === 1 ? "item" : "items"} to your cart`,
    );
    void navigate("/cart");
  }

  return (
    <Button type="button" variant="outline" size="sm" className="w-fit" onClick={orderAgain}>
      <RotateCcw aria-hidden="true" /> Order again
    </Button>
  );
}
