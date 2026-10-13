import { ArrowRight, Search, User } from "lucide-react";
import { useSyncExternalStore, type ReactNode } from "react";
import { Link, NavLink } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import type { NavLink as NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

const SCROLL_THRESHOLD = 24;

function subscribeToScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** True once the page has scrolled past the threshold; false during pre-rendering. */
function useScrolled(): boolean {
  return useSyncExternalStore(
    subscribeToScroll,
    () => window.scrollY > SCROLL_THRESHOLD,
    () => false,
  );
}

const iconLink =
  "inline-flex size-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-forest-50";

/**
 * Sticky site header (SITE-01). Feature-specific controls such as the cart come in through
 * `actions`, so this component stays independent of features (ARCHITECTURE.md §5).
 */
export function SiteHeader({
  nav,
  quote,
  actions,
  mobileExtras,
}: {
  nav: NavItem[];
  quote: NavItem;
  actions?: ReactNode;
  mobileExtras?: ReactNode;
}) {
  const scrolled = useScrolled();

  return (
    <header
      data-scrolled={scrolled}
      className="header-glass sticky top-0 z-40 border-b border-transparent bg-white transition-[background-color,box-shadow,border-color] duration-200"
    >
      <Container className="flex h-16 items-center justify-between gap-3 lg:h-[72px]">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((link) => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-3.5 py-2 text-[0.9375rem] font-medium text-ink-700 transition-colors hover:bg-forest-50 hover:text-forest-900",
                      isActive && "bg-forest-50 text-forest-900",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5">
          <Link to="/search" aria-label="Search" className={iconLink}>
            <Search aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </Link>
          <Link
            to="/account"
            aria-label="My account"
            className={cn(iconLink, "hidden sm:inline-flex")}
          >
            <User aria-hidden="true" className="size-5" strokeWidth={1.75} />
          </Link>
          {actions}
          <Button asChild size="sm" className="ml-2 hidden lg:inline-flex">
            <Link to={quote.href}>
              {quote.label} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <MobileNav nav={nav} quote={quote} extras={mobileExtras} />
        </div>
      </Container>
    </header>
  );
}
