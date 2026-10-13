import { useCallback } from "react";

import { formatQuantity } from "@/domain/units";
import { notifySuccess } from "@/lib/notify";
import type { ImageAsset, MinorUnits, SaleUnit } from "@/types/domain";

import { useCartStore } from "./cart.store";

/** The smallest rendition: cart thumbnails are tiny, so they never fetch the large image. */
export function thumbnailSrc(image: ImageAsset | null): string | null {
  if (!image) return null;
  return image.srcSet?.split(",")[0]?.trim().split(/\s+/)[0] ?? image.src;
}

export interface AddToCartInput {
  product: { slug: string; name: string; image: ImageAsset | null };
  variant: { id: string; name: string; unit: SaleUnit; priceMinor: MinorUnits };
  quantity: number;
}

/**
 * Adds an item and confirms it with a toast, which is a polite live region (DESIGN_SYSTEM.md §12:
 * badge bump + toast, no fly-to-cart). Quantity rules are enforced by the caller's selector and
 * again by the server quote (BR-06).
 */
export function useAddToCart() {
  const addItem = useCartStore((state) => state.addItem);

  return useCallback(
    ({ product, variant, quantity }: AddToCartInput) => {
      addItem({
        variantId: variant.id,
        quantity,
        snapshot: {
          productSlug: product.slug,
          productName: product.name,
          variantName: variant.name,
          unit: variant.unit,
          unitPriceMinor: variant.priceMinor,
          imageSrc: thumbnailSrc(product.image),
        },
      });
      notifySuccess(
        `Added ${formatQuantity(quantity, variant.unit)} of ${product.name} to your cart`,
      );
    },
    [addItem],
  );
}
