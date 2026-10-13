import { describe, expect, it } from "vitest";

import { formatKES, isWholeShillings, parseShillingsInput, shillingsToMinor } from "./money";

describe("formatKES", () => {
  it("formats whole shillings without decimals", () => {
    expect(formatKES(125_000)).toBe("KSh 1,250");
    expect(formatKES(52_000)).toBe("KSh 520");
    expect(formatKES(0)).toBe("KSh 0");
  });

  it("shows cents only when present", () => {
    expect(formatKES(125_050)).toBe("KSh 1,250.50");
    expect(formatKES(105)).toBe("KSh 1.05");
  });

  it("groups large amounts", () => {
    expect(formatKES(1_234_567_800)).toBe("KSh 12,345,678");
  });

  it("uses a minus sign for negative amounts (refund display)", () => {
    expect(formatKES(-50_000)).toBe("−KSh 500");
  });

  it("rejects non-integer minor units", () => {
    expect(() => formatKES(12.5)).toThrow(TypeError);
  });
});

describe("shillingsToMinor (BR-02)", () => {
  it("converts whole shillings", () => {
    expect(shillingsToMinor(520)).toBe(52_000);
  });
  it("rejects fractional shillings", () => {
    expect(() => shillingsToMinor(10.5)).toThrow(TypeError);
  });
});

describe("isWholeShillings", () => {
  it("accepts whole shillings and rejects cents", () => {
    expect(isWholeShillings(52_000)).toBe(true);
    expect(isWholeShillings(52_050)).toBe(false);
  });
});

describe("parseShillingsInput", () => {
  it.each([
    ["1,250", 125_000],
    ["KSh 1250", 125_000],
    ["ksh. 520", 52_000],
    [" 0 ", 0],
  ])("parses %j", (input, expected) => {
    expect(parseShillingsInput(input)).toBe(expected);
  });

  it.each(["", "abc", "12.50", "-5", "1,2,3,4,5,6,7,8,9,0"])("rejects %j", (input) => {
    expect(parseShillingsInput(input)).toBeNull();
  });
});
