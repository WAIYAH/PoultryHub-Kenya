import { Hammer } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

/** Marks a scaffolded page that isn't built yet, so nobody mistakes it for finished work. */
export function PlaceholderNotice({ phase, summary }: { phase: number; summary: string }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-ink-400 bg-white p-6 sm:p-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-1 text-eyebrow text-forest-800">
        <Hammer aria-hidden="true" className="size-4" /> Planned for Phase {phase}
      </span>
      <p className="max-w-prose text-ink-700">{summary}</p>
      <p className="max-w-prose text-sm text-ink-600">
        This page is a scaffold from Phase 1 (foundation). Its content and behaviour are specified
        in REQUIREMENTS.md and built in the phase shown above.
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
