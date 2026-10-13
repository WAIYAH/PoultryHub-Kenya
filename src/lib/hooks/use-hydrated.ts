import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

/**
 * False during pre-rendering and the hydration render, true afterwards.
 * Gate browser-only UI (cart count, signed-in state, scroll reveals) behind it so the
 * client's first render matches the pre-rendered HTML exactly (ARCHITECTURE.md §4).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
