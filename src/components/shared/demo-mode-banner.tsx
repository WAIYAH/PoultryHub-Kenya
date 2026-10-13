import { FlaskConical } from "lucide-react";

/** Persistent notice whenever sample data is in use (DESIGN_SYSTEM.md §11, TESTING AC-12). */
export function DemoModeBanner() {
  return (
    <div role="note" data-testid="demo-mode-banner" className="bg-gold-100 text-gold-800">
      <p className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-4 py-2 text-center text-sm font-medium">
        <FlaskConical aria-hidden="true" className="size-4 shrink-0" />
        Demo mode: sample products and prices. No real orders or payments.
      </p>
    </div>
  );
}
