import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRoutesStub } from "react-router";
import { describe, expect, it } from "vitest";

import { useCartStore } from "@/features/cart";
import { getServices } from "@/services";

import { ProductCard } from "./product-card";

// Product card (CAT-01, CAT-07, CAT-08, CAT-11) on real sample products, loaded through the
// service layer like the app does (the mock has no latency in tests).

async function renderCard(slug: string) {
  const { catalog, content } = getServices();
  const [page, settings] = await Promise.all([
    catalog.listProducts({ pageSize: 100 }),
    content.getSettings(),
  ]);
  const product = page.items.find((item) => item.slug === slug);
  if (!product) throw new Error(`No sample product "${slug}"`);
  // The card reads site settings from the root route, as in the app.
  const Stub = createRoutesStub([
    {
      id: "root",
      path: "/",
      loader: () => ({ settings }),
      Component: () => <ProductCard product={product} />,
    },
  ]);
  render(<Stub />);
  return product;
}

describe("ProductCard", () => {
  it("links to the product and shows price per unit and the minimum order", async () => {
    await renderCard("layer-chicks");
    const link = await screen.findByRole("link", { name: "Layer day-old chicks" });
    expect(link).toHaveAttribute("href", "/products/layer-chicks");
    expect(screen.getByText("Min. 100 chicks")).toBeInTheDocument();
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("adds the minimum order quantity, named after its visible label (WCAG 2.5.3)", async () => {
    const user = userEvent.setup();
    const product = await renderCard("layer-chicks");
    const add = await screen.findByRole("button", {
      name: "Add 100: 100 chicks of Layer day-old chicks",
    });
    await user.click(add);
    expect(useCartStore.getState().lines).toMatchObject([
      { variantId: product.defaultVariant.id, quantity: 100 },
    ]);
  });

  it("offers a quote instead of a cart button for enquiry-only products (CAT-07)", async () => {
    await renderCard("regular-egg-supply");
    expect(await screen.findByText("Get a quote")).toBeInTheDocument();
    expect(screen.getByText("Indicative price")).toBeInTheDocument();
    expect(screen.queryByTestId("card-add-to-cart")).not.toBeInTheDocument();
  });

  it("can't add an out-of-stock product", async () => {
    await renderCard("spent-layers");
    expect(await screen.findByRole("button", { name: "Out of stock" })).toBeDisabled();
    expect(screen.getByText("Out of stock: check back soon")).toBeInTheDocument();
  });

  it("books pre-order batches and says when they're ready (CAT-08)", async () => {
    await renderCard("broiler-chicks");
    expect(await screen.findByRole("button", { name: /^Book now:/ })).toBeEnabled();
    expect(screen.getByText(/^Ready from /)).toBeInTheDocument();
  });
});
