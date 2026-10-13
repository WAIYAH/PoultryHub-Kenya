// KES formatting and conversion (DESIGN_SYSTEM.md §14, REQUIREMENTS.md BR-02).
// Money is always integer minor units; floating-point arithmetic on money is never used.

const grouping = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0, useGrouping: true });

function assertMinor(minor: number): void {
  if (!Number.isSafeInteger(minor)) {
    throw new TypeError(`Money must be an integer number of minor units, received ${minor}`);
  }
}

/** `125000` → `"KSh 1,250"`; `125050` → `"KSh 1,250.50"`; negatives use a true minus sign. */
export function formatKES(minor: number): string {
  assertMinor(minor);
  const sign = minor < 0 ? "−" : "";
  const absolute = Math.abs(minor);
  const shillings = Math.trunc(absolute / 100);
  const cents = absolute % 100;
  const amount = grouping.format(shillings);
  return cents === 0
    ? `${sign}KSh ${amount}`
    : `${sign}KSh ${amount}.${String(cents).padStart(2, "0")}`;
}

/** Whole shillings → minor units. Rejects fractional shillings (prices are whole shillings). */
export function shillingsToMinor(shillings: number): number {
  if (!Number.isSafeInteger(shillings)) {
    throw new TypeError(`Expected whole shillings, received ${shillings}`);
  }
  return shillings * 100;
}

/** True when an amount is a whole number of shillings, as M-Pesa requires. */
export function isWholeShillings(minor: number): boolean {
  return Number.isSafeInteger(minor) && minor % 100 === 0;
}

/**
 * Parses admin or customer input such as "1,250" or "KSh 1250" into minor units.
 * Returns null for anything that isn't a non-negative whole-shilling amount.
 */
export function parseShillingsInput(input: string): number | null {
  const cleaned = input
    .trim()
    .replace(/^ksh\.?\s*/i, "")
    .replaceAll(",", "")
    .replaceAll(" ", "");
  if (!/^\d{1,9}$/.test(cleaned)) return null;
  return Number(cleaned) * 100;
}
