import type { ReactNode } from "react";

import { Container } from "@/components/shared/container";

/** The frame every sign-in, sign-up and password page shares: one centred card with its h1. */
export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Container className="flex justify-center py-10 sm:py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-h1 text-ink-900">{title}</h1>
          {description ? <p className="text-ink-700">{description}</p> : null}
        </div>
        <div className="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-card sm:p-7">
          {children}
        </div>
        {footer ? <div className="text-center text-sm text-ink-700">{footer}</div> : null}
      </div>
    </Container>
  );
}

/** A form-level message (wrong password, account exists, link expired…). */
export function FormAlert({
  children,
  tone = "danger",
}: {
  children: ReactNode;
  tone?: "danger" | "success";
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={
        tone === "danger"
          ? "rounded-md bg-danger-bg p-3 text-sm text-danger"
          : "rounded-md bg-success-bg p-3 text-sm text-success-fg"
      }
    >
      {children}
    </div>
  );
}
