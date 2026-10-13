import { useMutation } from "@tanstack/react-query";
import { FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getServices } from "@/services";
import type { MockPaymentOutcome } from "@/types/domain";

const OUTCOMES: { outcome: MockPaymentOutcome; label: string }[] = [
  { outcome: "success", label: "Simulate success" },
  { outcome: "cancelled", label: "Simulate cancel" },
  { outcome: "insufficient_funds", label: "Simulate insufficient funds" },
  { outcome: "timeout", label: "Simulate timeout" },
  { outcome: "late_success", label: "Simulate late success" },
];

/** Whether this build may show the mock provider's controls (PAY-06, API_AND_INTEGRATIONS.md §8). */
export function mockPaymentsAvailable(): boolean {
  return (
    import.meta.env.VITE_APP_ENV !== "production" &&
    typeof getServices().payments.simulate === "function"
  );
}

/**
 * TEST CONTROLS (PAY-06): stand in for the customer's phone and M-Pesa, so every outcome of a
 * pending prompt can be tried. Never shown in production builds.
 */
export function MockPaymentControls({
  paymentId,
  onDone,
}: {
  paymentId: string;
  onDone: () => void;
}) {
  const simulate = useMutation({
    mutationFn: (outcome: MockPaymentOutcome) =>
      getServices().payments.simulate?.({ paymentId, outcome }) ?? Promise.resolve(),
    onSettled: onDone,
  });

  return (
    <section
      aria-labelledby="mock-controls-heading"
      data-testid="mock-payment-controls"
      className="flex flex-col gap-3 rounded-md border-2 border-dashed border-gold-500 bg-gold-100 p-4 print:hidden"
    >
      <h3
        id="mock-controls-heading"
        className="flex items-center gap-2 text-sm font-bold tracking-wide text-gold-800 uppercase"
      >
        <FlaskConical aria-hidden="true" className="size-4" /> Test controls
      </h3>
      <p className="text-sm text-ink-700">
        Demo: no payment is processed. Choose what M-Pesa does with this prompt.
      </p>
      <div className="flex flex-wrap gap-2">
        {OUTCOMES.map(({ outcome, label }) => (
          <Button
            key={outcome}
            type="button"
            size="sm"
            variant="outline"
            disabled={simulate.isPending}
            onClick={() => simulate.mutate(outcome)}
          >
            {label}
          </Button>
        ))}
      </div>
    </section>
  );
}
