import type { ComponentProps, ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface FieldProps {
  name: string;
  /** Defaults to `name`; set it when a page links to the field (e.g. from an error summary). */
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  optional?: boolean;
  className?: string;
}

export interface ControlProps {
  id: string;
  name: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
  "aria-required": true | undefined;
}

/**
 * Label, hint and inline error around one control (DESIGN_SYSTEM.md §11 "Error (form)"). Use
 * `TextField`/`TextAreaField`, or render your own control with the props it passes.
 */
export function FieldShell({
  name,
  id = name,
  label,
  hint,
  error,
  optional = false,
  className,
  children,
}: FieldProps & { children: (control: ControlProps) => ReactNode }) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-900">
        {label}
        {optional ? <span className="font-normal text-ink-600"> (optional)</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-600">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        name,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
        "aria-required": optional ? undefined : true,
      })}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** A labelled input. Spread React Hook Form's `register(name)` onto it. */
export function TextField({
  name,
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...input
}: FieldProps & Omit<ComponentProps<"input">, "id" | "name" | "className">) {
  return (
    <FieldShell {...{ name, id, label, hint, error, optional, className }}>
      {(control) => <Input {...input} {...control} className="bg-white" />}
    </FieldShell>
  );
}

/** A labelled multi-line field. */
export function TextAreaField({
  name,
  id,
  label,
  hint,
  error,
  optional,
  className,
  ...textarea
}: FieldProps & Omit<ComponentProps<"textarea">, "id" | "name" | "className">) {
  return (
    <FieldShell {...{ name, id, label, hint, error, optional, className }}>
      {(control) => <Textarea {...textarea} {...control} className="min-h-20 bg-white" />}
    </FieldShell>
  );
}
