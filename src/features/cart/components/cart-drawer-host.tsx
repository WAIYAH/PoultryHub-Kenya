import { Suspense, lazy } from "react";

import { useCartUi } from "../cart-ui.store";

export const loadCartDrawer = () => import("./cart-drawer");
const CartDrawer = lazy(loadCartDrawer);

/** Mounts the cart drawer once it has been asked for; until then nothing is loaded. */
export function CartDrawerHost() {
  const requested = useCartUi((state) => state.drawerRequested);
  if (!requested) return null;
  return (
    <Suspense fallback={null}>
      <CartDrawer />
    </Suspense>
  );
}
