import { describe, expect, it } from "vitest";

import {
  clampQuantity,
  describeQuantityRule,
  formatQuantity,
  isValidQuantity,
  maxValidQuantity,
  stepQuantity,
  unitLabel,
  type QuantityRule,
} from "./units";

const chicks: QuantityRule = { min: 50, step: 10, max: 500, available: 230 };
const trays: QuantityRule = { min: 1, step: 1 };

describe("BR-06 quantity rules", () => {
  it("accepts quantities on the MOQ/step grid within limits", () => {
    expect(isValidQuantity(50, chicks)).toBe(true);
    expect(isValidQuantity(60, chicks)).toBe(true);
    expect(isValidQuantity(230, chicks)).toBe(true);
  });

  it("rejects quantities below the MOQ", () => {
    expect(isValidQuantity(40, chicks)).toBe(false);
  });

  it("rejects quantities off the step", () => {
    expect(isValidQuantity(55, chicks)).toBe(false);
  });

  it("rejects quantities above available stock or the per-order max", () => {
    expect(isValidQuantity(240, chicks)).toBe(false);
    expect(isValidQuantity(600, { ...chicks, available: 1000 })).toBe(false);
  });

  it("rejects non-integers", () => {
    expect(isValidQuantity(1.5, trays)).toBe(false);
  });

  it("allows any quantity >= min when nothing caps it", () => {
    expect(isValidQuantity(999, trays)).toBe(true);
  });
});

describe("maxValidQuantity", () => {
  it("rounds the tighter cap down onto the step grid", () => {
    expect(maxValidQuantity(chicks)).toBe(230);
    expect(maxValidQuantity({ ...chicks, available: 235 })).toBe(230);
  });
  it("is null when stock is below the MOQ", () => {
    expect(maxValidQuantity({ ...chicks, available: 40 })).toBeNull();
  });
  it("is null when uncapped", () => {
    expect(maxValidQuantity(trays)).toBeNull();
  });
});

describe("clampQuantity", () => {
  it("snaps to the nearest valid quantity at or below the input", () => {
    expect(clampQuantity(57, chicks)).toBe(50);
    expect(clampQuantity(10, chicks)).toBe(50);
    expect(clampQuantity(999, chicks)).toBe(230);
  });
  it("returns null when nothing can be ordered", () => {
    expect(clampQuantity(50, { ...chicks, available: 0 })).toBeNull();
  });
});

describe("stepQuantity", () => {
  it("moves by the step and stops at limits", () => {
    expect(stepQuantity(50, chicks, 1)).toBe(60);
    expect(stepQuantity(50, chicks, -1)).toBeNull();
    expect(stepQuantity(230, chicks, 1)).toBeNull();
    expect(stepQuantity(3, trays, -1)).toBe(2);
  });
});

describe("labels", () => {
  it("pluralises units", () => {
    expect(unitLabel("tray", 1)).toBe("tray");
    expect(unitLabel("tray", 2)).toBe("trays");
    expect(formatQuantity(1500, "chick")).toBe("1,500 chicks");
  });
  it("describes rules in plain English", () => {
    expect(describeQuantityRule(chicks, "chick")).toBe(
      "Minimum 50 chicks, in multiples of 10, up to 500 chicks per order",
    );
    expect(describeQuantityRule(trays, "tray")).toBeNull();
  });
});
