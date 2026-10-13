import type { SaleUnit } from "@/types/domain";

// Sale units and quantity rules (REQUIREMENTS.md BR-05, BR-06).

const UNIT_LABELS: Record<SaleUnit, { one: string; many: string }> = {
  tray: { one: "tray", many: "trays" },
  crate: { one: "crate", many: "crates" },
  dozen: { one: "dozen", many: "dozen" },
  piece: { one: "piece", many: "pieces" },
  chick: { one: "chick", many: "chicks" },
  bird: { one: "bird", many: "birds" },
  bag: { one: "bag", many: "bags" },
  kg: { one: "kg", many: "kg" },
  litre: { one: "litre", many: "litres" },
  pack: { one: "pack", many: "packs" },
};

export function unitLabel(unit: SaleUnit, quantity = 1): string {
  return quantity === 1 ? UNIT_LABELS[unit].one : UNIT_LABELS[unit].many;
}

export function formatQuantity(quantity: number, unit: SaleUnit): string {
  return `${quantity.toLocaleString("en-KE")} ${unitLabel(unit, quantity)}`;
}

export interface QuantityRule {
  min: number;
  step: number;
  /** Per-order maximum, if any. */
  max?: number | null;
  /** Stock available to sell, if stock is tracked. */
  available?: number | null;
}

/** Largest valid quantity under all limits, or null when nothing can be ordered. */
export function maxValidQuantity(rule: QuantityRule): number | null {
  const caps = [rule.max, rule.available].filter(
    (cap): cap is number => cap !== null && cap !== undefined,
  );
  if (caps.length === 0) return null;
  const cap = Math.min(...caps);
  if (cap < rule.min) return null;
  return rule.min + Math.floor((cap - rule.min) / rule.step) * rule.step;
}

/** BR-06: integer, ≥ MOQ, (q − MOQ) divisible by step, ≤ max, ≤ available stock. */
export function isValidQuantity(quantity: number, rule: QuantityRule): boolean {
  if (!Number.isInteger(quantity) || quantity < rule.min) return false;
  if ((quantity - rule.min) % rule.step !== 0) return false;
  const upper = maxValidQuantity(rule);
  const hasCap = rule.max != null || rule.available != null;
  if (hasCap && (upper === null || quantity > upper)) return false;
  return true;
}

/** Nearest valid quantity at or below `quantity` (never below MOQ); null if nothing is orderable. */
export function clampQuantity(quantity: number, rule: QuantityRule): number | null {
  const upper = maxValidQuantity(rule);
  const hasCap = rule.max != null || rule.available != null;
  if (hasCap && upper === null) return null;
  const bounded = Math.max(
    rule.min,
    Math.min(Math.floor(quantity), upper ?? Number.MAX_SAFE_INTEGER),
  );
  return rule.min + Math.floor((bounded - rule.min) / rule.step) * rule.step;
}

/** Next valid quantity when stepping up (+1) or down (−1), or null at a limit. */
export function stepQuantity(
  quantity: number,
  rule: QuantityRule,
  direction: 1 | -1,
): number | null {
  const current = clampQuantity(quantity, rule);
  if (current === null) return null;
  const next = current + direction * rule.step;
  return isValidQuantity(next, rule) ? next : null;
}

/** Human-readable rule, e.g. "Minimum 50 chicks, in multiples of 10". */
export function describeQuantityRule(rule: QuantityRule, unit: SaleUnit): string | null {
  const parts: string[] = [];
  if (rule.min > 1) parts.push(`Minimum ${formatQuantity(rule.min, unit)}`);
  if (rule.step > 1) parts.push(`in multiples of ${rule.step}`);
  if (rule.max != null) parts.push(`up to ${formatQuantity(rule.max, unit)} per order`);
  if (parts.length === 0) return null;
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
