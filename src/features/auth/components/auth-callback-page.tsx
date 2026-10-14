import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import { errorMessage } from "@/lib/errors";
import { getServices } from "@/services";
import type { Session } from "@/types/domain";

import { safeNextPath } from "../safe-next";

import { AuthShell } from "./auth-shell";

// Codes are single use, and React runs effects twice in development: exchange each code once.
const exchanges = new Map<string, Promise<Session>>();

function exchangeOnce(code: string): Promise<Session> {
  let pending = exchanges.get(code);
  if (!pending) {
    pending = getServices().auth.exchangeCode(code);
    exchanges.set(code, pending);
  }
  return pending;
}

/**
 * Where links from emails land (sign-up confirmation, password reset): trades the one-time code
 * for a session, then continues to `next`. The reset flow continues to the new-password form.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    let active = true;
    exchangeOnce(code).then(
      () => {
        if (!active) return;
        queryClient.removeQueries({ queryKey: ["account"] });
        queryClient.removeQueries({ queryKey: ["orders"] });
        // The reset form is an auth page, which safeNextPath refuses; allow just that one.
        const target = next === "/auth/reset-password" ? next : safeNextPath(next);
        void navigate(target, { replace: true });
      },
      (reason: unknown) => {
        if (active) setError(errorMessage(reason));
      },
    );
    return () => {
      active = false;
    };
  }, [code, next, navigate, queryClient]);

  if (!code || error) {
    return (
      <AuthShell title="This link didn't work">
        <p className="text-ink-700" role="alert">
          {error ?? "The link is incomplete. Open it again from your email."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link to="/auth/sign-in" className={buttonVariants()}>
            Sign in
          </Link>
          <Link to="/auth/forgot-password" className={buttonVariants({ variant: "outline" })}>
            Get a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Signing you in">
      <p className="flex items-center justify-center gap-2 text-ink-700" role="status">
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin" /> Checking your link…
      </p>
    </AuthShell>
  );
}
