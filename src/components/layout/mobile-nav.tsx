import { Menu } from "lucide-react";
import { Suspense, lazy, useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import type { NavLink as NavItem } from "@/config/site";

const loadSheet = () => import("./mobile-nav-sheet");
const MobileNavSheet = lazy(loadSheet);

/**
 * Menu button for screens below `lg` (DESIGN_SYSTEM.md §9.2). The sheet is loaded on first use and
 * prefetched when the browser is idle, so opening it is instant without weighing down page load.
 */
export function MobileNav({
  nav,
  quote,
  extras,
}: {
  nav: NavItem[];
  quote: NavItem;
  extras?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prefetch = () => void loadSheet();
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(prefetch, { timeout: 4_000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = setTimeout(prefetch, 2_000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-testid="mobile-menu-button"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
      >
        <Menu aria-hidden="true" className="size-6" />
      </Button>
      {requested ? (
        <Suspense fallback={null}>
          <MobileNavSheet
            open={open}
            onOpenChange={setOpen}
            nav={nav}
            quote={quote}
            extras={extras}
            returnFocusRef={buttonRef}
          />
        </Suspense>
      ) : null}
    </>
  );
}
