/** First focusable element on every page (DESIGN_SYSTEM.md §13). */
export function SkipLink({ targetId = "main-content" }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only rounded-full bg-forest-900 px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60]"
    >
      Skip to content
    </a>
  );
}
