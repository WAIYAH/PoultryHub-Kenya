import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriceDisplay } from "./price-display";

describe("PriceDisplay (KM-1)", () => {
  it("shows the KSh price with its unit", () => {
    const { container } = render(<PriceDisplay priceMinor={52_000} unit="tray" />);
    expect(container).toHaveTextContent("KSh 520/ tray");
    expect(screen.getByText("KSh 520")).toBeInTheDocument();
  });

  it("prefixes 'From' for multi-variant products", () => {
    render(<PriceDisplay priceMinor={12_000} unit="chick" from />);
    expect(screen.getByText("From")).toBeInTheDocument();
  });

  it("announces a genuine previous price as 'was'", () => {
    const { container } = render(
      <PriceDisplay priceMinor={420_000} unit="bag" compareAtMinor={450_000} />,
    );
    expect(container).toHaveTextContent("was KSh 4,500");
  });

  it("hides a compare-at price that isn't higher", () => {
    const { container } = render(<PriceDisplay priceMinor={420_000} compareAtMinor={400_000} />);
    expect(container).not.toHaveTextContent("was");
  });
});
