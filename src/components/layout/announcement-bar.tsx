import { X } from "lucide-react";
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
 * Admin-controlled notice such as holiday hours (SITE-08). Shown only after hydration, so a
 * visitor who dismissed it never sees it flash in the pre-rendered HTML.
 */
export function AnnouncementBar({ id, message }: { id: string; message: string }) {
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);

  if (!hydrated || dismissed || readDismissed(id)) return null;

  return (
    <div role="region" aria-label="Announcement" className="bg-forest-900 text-white">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3 px-4 py-2 text-sm">
        <p className="flex-1 text-center">{message}</p>
        <button
          type="button"
          aria-label="Dismiss announcement"
          className="grid size-9 place-items-center rounded-full hover:bg-white/10"
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
