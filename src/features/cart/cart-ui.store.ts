import { create } from "zustand";

// UI-only cart state: whether the drawer is open. Not persisted.

interface CartUiState {
  drawerOpen: boolean;
  /** Has the drawer ever been opened (its code is loaded on first use, NFR-PERF-3). */
  drawerRequested: boolean;
}

export const useCartUi = create<CartUiState>()(() => ({
  drawerOpen: false,
  drawerRequested: false,
}));

export function openCartDrawer(): void {
  useCartUi.setState({ drawerOpen: true, drawerRequested: true });
}

export function setCartDrawerOpen(open: boolean): void {
  useCartUi.setState({ drawerOpen: open });
}
