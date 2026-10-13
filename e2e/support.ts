import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/** Collects console errors and uncaught exceptions (including React hydration mismatches). */
export function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

/** Waits until React has hydrated the page (the cart rehydration effect has run). */
export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForFunction(() => document.documentElement.dataset.hydrated === "true");
}

/** Fails on serious or critical axe violations (DESIGN_SYSTEM.md §13, TESTING.md §6.6). */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  // Let finite entrance animations finish: axe would otherwise measure contrast on half-faded
  // elements. Looping animations (spinners, skeleton pulses) are ignored.
  await page.waitForFunction(() =>
    document.getAnimations().every((animation) => {
      const iterations = animation.effect?.getTiming().iterations;
      return iterations === Infinity || animation.playState !== "running";
    }),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  expect(
    serious.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
    ),
  ).toEqual([]);
}

/** No horizontal page scroll (NFR-COMP-2). */
export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
