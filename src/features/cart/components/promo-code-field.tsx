import { TicketPercent, X } from "lucide-react";
import { useId, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { CartQuote } from "@/types/domain";

/**
 * Promo code entry (CART-06). The server quote decides whether a code applies, and why not
 * (BR-30); this only collects the code and shows the outcome.
 */
export function PromoCodeField({
  code,
  quote,
  pending,
  onApply,
  onRemove,
}: {
  code: string | null;
  quote: CartQuote | undefined;
  pending: boolean;
  onApply: (code: string) => void;
  onRemove: () => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const rejection = quote?.issues.find((issue) => issue.code === "PROMO_INVALID");
  const applied = code && quote?.promo?.code === code ? quote.promo : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (draft.trim()) onApply(draft.trim());
    setDraft("");
  }

  if (code) {
    return (
      <div className="flex flex-col gap-1.5" aria-live="polite">
        <div className="flex items-center justify-between gap-2 rounded-md bg-forest-50 px-3 py-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-forest-900">
            <TicketPercent aria-hidden="true" className="size-4" />
            {code}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove promo code ${code}`}
            className="grid size-9 place-items-center rounded-full text-ink-700 hover:bg-white"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {pending && !applied && !rejection ? (
          <p className="text-sm text-ink-600">Checking the code…</p>
        ) : applied ? (
          <p className="text-sm text-success-fg">{applied.description}</p>
        ) : rejection ? (
          <p className="text-sm text-danger" data-testid="promo-error">
            {rejection.reason}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-900">
        Promo code
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value.toUpperCase())}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={20}
          className="h-11 min-w-0 flex-1 rounded-md border border-input bg-white px-3 text-base text-ink-900 uppercase placeholder:normal-case focus-visible:border-ring"
          placeholder="Enter a code"
        />
        <Button type="submit" variant="secondary" disabled={!draft.trim()}>
          Apply
        </Button>
      </div>
    </form>
  );
}
