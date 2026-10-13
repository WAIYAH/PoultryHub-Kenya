import { Info, X } from "lucide-react";
import { useState } from "react";

import { useHydrated } from "@/lib/hooks/use-hydrated";

const STORAGE_PREFIX = "phk-announcement-dismissed:";

function readDismissed(id: string): boolean {
  try {
    return window.localStorage.getItem(STORAGE_PREFIX + id) === "1";
  } catch {
    return false;
  }
}

/**
 * Admin-controlled notice such as holiday hours (SITE-08, KM-11), dismissible per visitor.
 * It is part of the pre-rendered HTML so it never pushes the page down after load (CLS); only
 * visitors who already dismissed it see it removed once the page hydrates.
 */
export function AnnouncementBar({ id, message }: { id: string; message: string }) {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || (hydrated && readDismissed(id))) return null;

  return (
    <div
      role="region"
      aria-label="Announcement"
      data-surface="dark"
      className="bg-forest-900 text-white"
    >
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 py-1 pr-2 pl-4 text-sm sm:pl-6">
        <Info aria-hidden="true" className="size-4 shrink-0 text-forest-300" />
        <p className="flex-1">{message}</p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_PREFIX + id, "1");
            } catch {
              // Storage can be unavailable (private mode); dismissing for this page view is enough.
            }
            setDismissed(true);
          }}
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
