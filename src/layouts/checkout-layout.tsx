import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link, Outlet } from "react-router";

import { Logo } from "@/components/layout/logo";
import { SkipLink } from "@/components/layout/skip-link";
import { Container } from "@/components/shared/container";
import { DemoModeBanner } from "@/components/shared/demo-mode-banner";
import { footerNav } from "@/config/site";

const isDemo = import.meta.env.VITE_DATA_SOURCE !== "supabase";

/** Distraction-free chrome for checkout: no main navigation, no floating buttons. */
export default function CheckoutLayout() {
  return (
    <>
      <SkipLink />
      {isDemo ? <DemoModeBanner /> : null}
      <header className="border-b border-line bg-white">
        <Container className="flex h-16 items-center justify-between gap-3">
          <Logo />
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-forest-800">
            <LockKeyhole aria-hidden="true" className="size-4" /> Secure checkout
          </p>
        </Container>
      </header>
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Container className="py-4">
          <Link
            to="/cart"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-forest-700 hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to cart
          </Link>
        </Container>
        <Outlet />
      </main>
      <footer className="border-t border-line bg-white">
        <Container className="flex flex-wrap gap-x-5 gap-y-2 py-6 text-sm text-ink-600">
          {footerNav.policies.links.map((link) => (
            <Link key={link.href} to={link.href} className="hover:text-ink-900 hover:underline">
              {link.label}
            </Link>
          ))}
        </Container>
      </footer>
    </>
  );
}
