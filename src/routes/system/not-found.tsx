import { House, Search, ShoppingBasket } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/not-found";

export const meta: Route.MetaFunction = ({ location }) =>
  pageMeta({
    title: "Page not found",
    description: "The page you were looking for could not be found.",
    path: location.pathname,
    noindex: true,
  });

/** Catch-all 404. Static hosts answer 200 for SPA-fallback paths, hence the noindex. */
export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
      <p className="text-eyebrow text-forest-700">Error 404</p>
      <h1 className="text-h1 text-ink-900">We couldn't find that page</h1>
      <p className="max-w-lg text-lead text-ink-600">
        The link may be mistyped, or the page may have moved. These might help:
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/">
            <House aria-hidden="true" /> Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/shop">
            <ShoppingBasket aria-hidden="true" /> Shop
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link to="/search">
            <Search aria-hidden="true" /> Search
          </Link>
        </Button>
      </div>
    </Container>
  );
}
