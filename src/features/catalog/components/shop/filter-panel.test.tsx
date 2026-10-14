import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi } from "vitest";

import type { Category } from "@/types/domain";

import { DEFAULT_SHOP_STATE, type ShopState } from "../../shop-params";

import { FilterPanel } from "./filter-panel";

// Shop filters (CAT-02): category links keep the other filters, availability toggles, and the
// price range accepts whole shillings only.

const category = (slug: string, name: string, productCount: number): Category => ({
  id: slug,
  slug,
  name,
  description: "",
  image: null,
  productCount,
  fromPriceMinor: null,
});

const CATEGORIES = [category("eggs", "Eggs", 4), category("day-old-chicks", "Day-old chicks", 3)];

function renderPanel(state: Partial<ShopState> = {}, currentCategory: string | null = null) {
  const onChange = vi.fn();
  render(
    <MemoryRouter>
      <FilterPanel
        state={{ ...DEFAULT_SHOP_STATE, ...state }}
        categories={CATEGORIES}
        currentCategory={currentCategory}
        categoryHref={(slug) => (slug ? `/shop/${slug}?sort=price-asc` : "/shop?sort=price-asc")}
        onChange={onChange}
      />
    </MemoryRouter>,
  );
  return onChange;
}

describe("FilterPanel", () => {
  it("lists every category with its count and marks the current one", () => {
    renderPanel({}, "eggs");
    expect(screen.getByRole("link", { name: "All products" })).toHaveAttribute(
      "href",
      "/shop?sort=price-asc",
    );
    const eggs = screen.getByRole("link", { name: /^Eggs/ });
    expect(eggs).toHaveAttribute("href", "/shop/eggs?sort=price-asc");
    expect(eggs).toHaveAttribute("aria-current", "page");
    expect(eggs).toHaveTextContent("4");
  });

  it("adds and removes availability filters", async () => {
    const user = userEvent.setup();
    const onChange = renderPanel({ availability: ["pre_order"] });
    await user.click(screen.getByRole("checkbox", { name: "In stock" }));
    expect(onChange).toHaveBeenLastCalledWith({ availability: ["pre_order", "in_stock"] });
    await user.click(screen.getByRole("checkbox", { name: "Pre-order" }));
    expect(onChange).toHaveBeenLastCalledWith({ availability: [] });
  });

  it("applies a price range in whole shillings, ignoring other characters", async () => {
    const user = userEvent.setup();
    const onChange = renderPanel();
    await user.type(screen.getByLabelText("From"), "5a00");
    await user.type(screen.getByLabelText("To"), "2,000");
    await user.click(screen.getByRole("button", { name: "Apply price" }));
    expect(onChange).toHaveBeenLastCalledWith({ min: 500, max: 2000 });
  });

  it("offers to clear filters only when some are set", () => {
    renderPanel();
    expect(screen.queryByRole("button", { name: "Clear all filters" })).not.toBeInTheDocument();
  });

  it("clears every filter but keeps the category and sort", async () => {
    const user = userEvent.setup();
    const onChange = renderPanel({ q: "mayai", min: 100, availability: ["in_stock"] });
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(onChange).toHaveBeenLastCalledWith({ q: "", availability: [], min: null, max: null });
  });
});
