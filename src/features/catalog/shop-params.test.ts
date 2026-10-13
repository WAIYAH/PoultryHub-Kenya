import { describe, expect, it } from "vitest";

import {
  DEFAULT_SHOP_STATE,
  parseShopParams,
  shopSearch,
  toProductQuery,
  updateShopState,
} from "./shop-params";

const parse = (query: string) => parseShopParams(new URLSearchParams(query));

describe("shop URL state (CAT-02, CAT-03)", () => {
  it("parses every filter", () => {
    expect(parse("q=mayai&availability=in_stock&min=500&max=5000&sort=price-asc&page=2")).toEqual({
      q: "mayai",
      availability: ["in_stock"],
      min: 500,
      max: 5000,
      sort: "price-asc",
      page: 2,
    });
  });

  it("ignores malformed values instead of failing", () => {
    expect(parse("availability=sold&min=abc&max=-5&sort=random&page=0")).toEqual(
      DEFAULT_SHOP_STATE,
    );
    expect(parse("page=2.5").page).toBe(1);
  });

  it("swaps a reversed price range", () => {
    expect(parse("min=900&max=100")).toMatchObject({ min: 100, max: 900 });
  });

  it("accepts repeated or comma-separated availability, without duplicates", () => {
    expect(parse("availability=in_stock,pre_order&availability=in_stock").availability).toEqual([
      "in_stock",
      "pre_order",
    ]);
  });

  it("round-trips through the URL and omits defaults", () => {
    const state = parse("q=eggs&availability=pre_order&max=1000&sort=newest&page=3");
    expect(parse(shopSearch(state).slice(1))).toEqual(state);
    expect(shopSearch(DEFAULT_SHOP_STATE)).toBe("");
  });

  it("returns to page 1 whenever a filter changes", () => {
    const onPage3 = { ...DEFAULT_SHOP_STATE, page: 3 };
    expect(updateShopState(onPage3, { sort: "name" }).page).toBe(1);
    expect(updateShopState(onPage3, { page: 4 }).page).toBe(4);
  });

  it("builds the catalogue query in minor units, with low stock counted as in stock", () => {
    expect(toProductQuery(parse("availability=in_stock&min=500"), "eggs")).toEqual({
      category: "eggs",
      availability: ["in_stock", "low_stock"],
      minPriceMinor: 50_000,
      sort: "featured",
      page: 1,
      pageSize: 24,
    });
  });
});
