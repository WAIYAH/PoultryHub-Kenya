import { describe, expect, it } from "vitest";

import { COUNTY_NAMES_SORTED, KENYAN_COUNTIES, isCountyName } from "./counties";

describe("Kenyan counties", () => {
  it("lists all 47 counties with unique codes and names", () => {
    expect(KENYAN_COUNTIES).toHaveLength(47);
    expect(new Set(KENYAN_COUNTIES.map((c) => c.code)).size).toBe(47);
    expect(new Set(KENYAN_COUNTIES.map((c) => c.name)).size).toBe(47);
  });

  it("uses sequential official codes 001–047", () => {
    expect(KENYAN_COUNTIES.map((c) => Number(c.code))).toEqual(
      Array.from({ length: 47 }, (_, i) => i + 1),
    );
  });

  it("sorts names alphabetically for menus", () => {
    expect(COUNTY_NAMES_SORTED[0]).toBe("Baringo");
    expect(COUNTY_NAMES_SORTED.at(-1)).toBe("West Pokot");
  });

  it("validates county names exactly", () => {
    expect(isCountyName("Nairobi")).toBe(true);
    expect(isCountyName("Murang'a")).toBe(true);
    expect(isCountyName("nairobi")).toBe(false);
    expect(isCountyName("Nairobi City")).toBe(false);
  });
});
