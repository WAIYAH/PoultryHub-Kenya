import { ArrowRight, User } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { Link, NavLink } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { NavLink as NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";

// The menu sheet itself. Loaded on demand by MobileNav (prefetched when idle) so the dialog
// code stays out of every page's initial bundle (NFR-PERF-3).
export default function MobileNavSheet({
  open,
  onOpenChange,
  nav,
  quote,
  extras,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nav: NavItem[];
  quote: NavItem;
  extras?: ReactNode;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[min(22rem,100vw)] flex-col gap-0 bg-white p-0"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <SheetHeader className="border-b border-line px-5 py-4">
          <SheetTitle asChild>
            <div>
              <Logo />
            </div>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {nav.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.href === "/"}
                  onClick={close}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-12 items-center rounded-md px-3 text-base font-semibold text-ink-900 hover:bg-forest-50",
                      isActive && "bg-forest-50 text-forest-800",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/account"
                onClick={close}
                className="flex min-h-12 items-center gap-2 rounded-md px-3 text-base font-semibold text-ink-900 hover:bg-forest-50"
              >
                <User aria-hidden="true" className="size-5" /> My account
              </NavLink>
            </li>
          </ul>
        </nav>
        <div className="flex flex-col gap-3 border-t border-line p-5">
          <Button asChild>
            <Link to={quote.href} onClick={close}>
              {quote.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          {extras}
        </div>
      </SheetContent>
    </Sheet>
  );
}
