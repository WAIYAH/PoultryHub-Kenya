import { LogIn, ShieldAlert } from "lucide-react";
import { Link } from "react-router";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { pageMeta } from "@/lib/seo";

import type { Route } from "./+types/access-denied";

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Access denied",
    description: "You don't have permission to view this page.",
    path: "/access-denied",
    noindex: true,
  });

/** 403 page. Server-side rules still apply; this only explains the redirect (ARCHITECTURE.md §6.2). */
export default function AccessDenied() {
  return (
    <Container className="flex flex-col items-center gap-6 py-20 text-center sm:py-28">
      <span className="grid size-14 place-items-center rounded-full bg-warning-bg text-warning-fg">
        <ShieldAlert aria-hidden="true" className="size-7" />
      </span>
      <h1 className="text-h1 text-ink-900">You don't have access to this page</h1>
      <p className="max-w-lg text-lead text-ink-600">
        If you work for the business, sign in with your staff account. Otherwise, head back to the
        shop.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/auth/sign-in">
            <LogIn aria-hidden="true" /> Sign in
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}
