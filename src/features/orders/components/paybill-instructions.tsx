import { useMutation } from "@tanstack/react-query";
import { CircleCheck } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { formatKES } from "@/domain/money";
import { useSiteSettings } from "@/features/content";
import { errorMessage } from "@/lib/errors";
import { getServices } from "@/services";
import type { OrderRef } from "@/types/domain";

/**
 * Manual Paybill (PAY-03): the Paybill number with the order number as the account, then an
 * optional M-Pesa code for staff to check. Sending the code never marks the order paid (BR-18).
 */
export function PaybillInstructions({
  orderRef,
  totalMinor,
  onSubmitted,
}: {
  orderRef: OrderRef;
  totalMinor: number;
  onSubmitted?: () => void;
}) {
  const id = useId();
  const settings = useSiteSettings();
  const [code, setCode] = useState("");
  const submit = useMutation({
    mutationFn: (reference: string) =>
      getServices().payments.submitPaybillReference({ ...orderRef, reference }),
    onSuccess: () => onSubmitted?.(),
  });

  function send(event: FormEvent) {
    event.preventDefault();
    if (code.trim()) submit.mutate(code.trim());
  }

  return (
    <div className="flex flex-col gap-4 text-sm text-ink-700" data-testid="paybill-instructions">
      <ol className="flex list-decimal flex-col gap-1.5 pl-5">
        <li>Open M-Pesa on your phone and choose Lipa na M-Pesa, then Pay Bill.</li>
        <li>
          {settings.payments.paybillDisplay ? (
            <>
              Use <strong className="text-ink-900">{settings.payments.paybillDisplay}</strong>.
            </>
          ) : (
            "Use our Paybill number (ask us on WhatsApp)."
          )}
        </li>
        <li>
          For the account number, enter{" "}
          <strong className="font-mono tracking-wide text-ink-900">{orderRef.orderNumber}</strong>.
        </li>
        <li>
          Pay exactly <strong className="text-ink-900">{formatKES(totalMinor)}</strong>, then enter
          your PIN.
        </li>
      </ol>

      {submit.isSuccess ? (
        <p
          className="flex items-start gap-2 rounded-md bg-success-bg p-3 text-success-fg"
          role="status"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Thanks. We'll check the code against our M-Pesa statement and confirm your order.
        </p>
      ) : (
        <form onSubmit={send} className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-code`} className="font-medium text-ink-900">
            Paid already? Enter the M-Pesa code from your SMS{" "}
            <span className="font-normal text-ink-600">(optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-code`}
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase())}
              placeholder="e.g. SJK7XYZ123"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={12}
              aria-invalid={submit.isError ? true : undefined}
              aria-describedby={submit.isError ? `${id}-error` : undefined}
              className="h-11 min-w-0 flex-1 rounded-md border border-input bg-white px-3 font-mono text-base text-ink-900 uppercase placeholder:font-sans placeholder:normal-case focus-visible:border-ring"
            />
            <Button
              type="submit"
              variant="secondary"
              loading={submit.isPending}
              disabled={!code.trim()}
            >
              Send code
            </Button>
          </div>
          {submit.isError ? (
            <p id={`${id}-error`} className="text-danger">
              {errorMessage(submit.error)}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
