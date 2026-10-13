import { CartPage } from "@/features/cart";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/cart";

// Cart (CART-03): client-rendered from the device's saved cart; never indexed.

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Your cart",
    description: "Your cart, saved on this device.",
    path: "/cart",
    noindex: true,
  });

export default function CartRoute() {
  return <CartPage />;
}
