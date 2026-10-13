import { Check, Copy } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/seo";

/**
 * The guest's secret order link (CHK-06, CHK-07): anyone with it can see the order, so it's shown
 * only to whoever already holds it, with a copy button and a plain field to copy by hand.
 */
export function TrackingLink({ orderNumber, token }: { orderNumber: string; token: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(`/orders/${orderNumber}?token=${encodeURIComponent(token)}`);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2_500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard blocked (e.g. plain http): select the link so it can be copied by hand.
      input.current?.select();
    }
  }

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="flex flex-col gap-3 rounded-lg bg-white p-5 text-sm text-ink-700 shadow-card sm:p-6 print:hidden"
    >
      <h2 id={`${id}-heading`} className="text-base font-bold text-ink-900">
        Save your order link
      </h2>
      <p>Use it to check your order and pay. Keep it private: anyone with it can see the order.</p>
      <label htmlFor={`${id}-url`} className="sr-only">
        Order link
      </label>
      <input
        ref={input}
        id={`${id}-url`}
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        className="h-11 w-full rounded-md border border-input bg-cream-50 px-3 text-sm text-ink-900"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => void copy()}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied" : ""}
      </p>
    </section>
  );
}
