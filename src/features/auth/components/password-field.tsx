import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { FieldShell, type FieldProps } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";

/** A password input with a show/hide button, so people on phones can check what they typed. */
export function PasswordField({
  name,
  id,
  label,
  hint,
  error,
  className,
  ...input
}: FieldProps & Omit<ComponentProps<"input">, "id" | "name" | "className" | "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell {...{ name, id, label, hint, error, className }}>
      {(control) => (
        <div className="relative">
          <input
            {...input}
            {...control}
            type={visible ? "text" : "password"}
            spellCheck={false}
            autoCapitalize="none"
            className={cn(
              "h-11 w-full rounded-md border border-input bg-white pr-12 pl-3 text-base text-ink-900 shadow-xs outline-none",
              "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "aria-invalid:border-destructive",
            )}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-pressed={visible}
            aria-controls={control.id}
            className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-ink-600 hover:text-ink-900"
          >
            {visible ? (
              <EyeOff aria-hidden="true" className="size-5" />
            ) : (
              <Eye aria-hidden="true" className="size-5" />
            )}
            <span className="sr-only">Show password</span>
          </button>
        </div>
      )}
    </FieldShell>
  );
}
