import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

/**
 * After client-side navigation, announces the new page title and moves focus to the page's h1,
 * as a full page load would (DESIGN_SYSTEM.md §13). Skips the initial load.
 */
export function RouteAnnouncer() {
  const { pathname } = useLocation();
  const [announcement, setAnnouncement] = useState("");
  // Compared by path, not a one-shot flag: Strict Mode runs effects twice in development, which
  // made the first page load look like a navigation and moved focus to its heading.
  const announcedPath = useRef(pathname);

  useEffect(() => {
    if (announcedPath.current === pathname) return;
    announcedPath.current = pathname;
    // Let the new route render and update document.title first.
    const timer = window.setTimeout(() => {
      setAnnouncement(document.title);
      const heading = document.querySelector<HTMLElement>("main h1");
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="route-announcer">
      {announcement}
    </div>
  );
}
