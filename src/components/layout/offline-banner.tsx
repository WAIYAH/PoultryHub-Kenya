import { WifiOff } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/**
 * "You're offline" notice (DESIGN_SYSTEM.md §11, KM-7). Assumes online during pre-rendering and
 * hydration, then follows the browser. Requests resume by themselves when the connection returns
 * (TanStack Query's online manager). The live region is always present so the change is announced.
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  return (
    <div role="status" className="sticky top-0 z-50">
      {online ? null : (
        <p
          data-testid="offline-banner"
          className="flex items-center justify-center gap-2 bg-ink-900 px-4 py-2 text-center text-sm font-medium text-white"
        >
          <WifiOff aria-hidden="true" className="size-4 shrink-0" />
          You're offline. Your cart is saved on this device.
        </p>
      )}
    </div>
  );
}
