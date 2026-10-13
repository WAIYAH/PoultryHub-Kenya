import fontLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";
import { QueryClientProvider } from "@tanstack/react-query";
import { House, ShoppingBasket } from "lucide-react";
import { Suspense, lazy, useEffect, useState, type ReactNode } from "react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";

import type { Route } from "./+types/root";
import { LogoMark } from "./components/layout/logo";
import { RouteAnnouncer } from "./components/layout/route-announcer";
import { Button } from "./components/ui/button";
import { site } from "./config/site";
import { useCartRehydration } from "./features/cart";
import { ConfigError } from "./lib/env";
import { useHydrated } from "./lib/hooks/use-hydrated";
import { createQueryClient } from "./lib/query-client";
import "./styles/app.css";

// Kept out of the initial bundle (NFR-PERF-3): the toast UI loads after hydration. Motion is not
// loaded here at all; components that need it use <MotionScope> (spike S4).
const Toaster = lazy(() =>
  import("./components/ui/sonner").then((mod) => ({ default: mod.Toaster })),
);

export const links: Route.LinksFunction = () => [
  { rel: "preload", href: fontLatin, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];

export const meta: Route.MetaFunction = () => [
  { title: site.name },
  { name: "description", content: site.description },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-KE">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#064e3b" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  // One client per app instance (never shared across pre-rendered pages).
  const [queryClient] = useState(createQueryClient);
  const hydrated = useHydrated();
  useCartRehydration();
  useEffect(() => {
    // Signal for E2E tests and diagnostics that React has taken over the pre-rendered HTML.
    document.documentElement.dataset.hydrated = "true";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <RouteAnnouncer />
      {hydrated ? (
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      ) : null}
    </QueryClientProvider>
  );
}

/** Shown by __spa-fallback.html while client-rendered pages load. */
export function HydrateFallback() {
  return (
    <div role="status" className="grid min-h-dvh place-items-center bg-cream-50">
      <div className="flex flex-col items-center gap-4">
        <LogoMark className="size-14 animate-pulse" />
        <p className="text-sm font-medium text-ink-600">Loading {site.name}…</p>
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  const title = notFound ? "Page not found" : "Something went wrong";
  const message = notFound
    ? "We couldn't find that page. It may have moved, or the link may be mistyped."
    : "Sorry, an unexpected error occurred. Please try again in a moment.";
  const configProblems =
    import.meta.env.DEV && error instanceof ConfigError ? error.problems : null;

  return (
    <main id="main-content" className="grid min-h-dvh place-items-center bg-cream-50 px-4 py-16">
      <div className="flex max-w-lg flex-col items-center gap-5 text-center">
        <LogoMark className="size-14" />
        <h1 className="text-h1 text-ink-900">{title}</h1>
        <p className="text-lead text-ink-600">{message}</p>
        {configProblems ? (
          <div className="w-full rounded-lg border border-danger bg-danger-bg p-4 text-left text-sm text-danger">
            <p className="font-semibold">Configuration problem (development only):</p>
            <ul className="mt-2 list-disc pl-5">
              {configProblems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">
              <House aria-hidden="true" /> Go home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/shop">
              <ShoppingBasket aria-hidden="true" /> Browse products
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
