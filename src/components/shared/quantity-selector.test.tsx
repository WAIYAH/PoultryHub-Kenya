import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import type { QuantityRule } from "@/domain/units";

import { QuantitySelector } from "./quantity-selector";

const chicks: QuantityRule = { min: 50, step: 10, max: 500, available: 230 };

function Harness({ rule = chicks, initial = 50 }: { rule?: QuantityRule; initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <QuantitySelector value={value} onChange={setValue} rule={rule} unit="chick" />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("QuantitySelector (BR-06)", () => {
  it("labels the input with the unit and describes the rule", () => {
    render(<Harness />);
    expect(screen.getByLabelText("Quantity (chicks)")).toHaveValue("50");
    expect(
      screen.getByText("Minimum 50 chicks, in multiples of 10, up to 500 chicks per order"),
    ).toBeInTheDocument();
  });

  it("steps by the order step and stops at the limits", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByTestId("value")).toHaveTextContent("60");
    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeEnabled();
  });

  it("snaps typed quantities onto the step grid and explains why", async () => {
    const user = userEvent.setup();
    render(<Harness initial={100} />);
    const input = screen.getByLabelText("Quantity (chicks)");

    await user.clear(input);
    await user.type(input, "75{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("70");
    expect(screen.getByText("Sold in multiples of 10. We've set 70 chicks.")).toBeInTheDocument();
  });

  it("caps at available stock and says so", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByLabelText("Quantity (chicks)");

    await user.clear(input);
    await user.type(input, "400");
    await user.tab();
    expect(screen.getByTestId("value")).toHaveTextContent("230");
    expect(screen.getByText("Only 230 chicks available.")).toBeInTheDocument();
  });

  it("enforces the minimum order", async () => {
    const user = userEvent.setup();
    render(<Harness initial={100} />);
    const input = screen.getByLabelText("Quantity (chicks)");

    await user.clear(input);
    await user.type(input, "20{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("50");
    expect(screen.getByText("The minimum order is 50 chicks.")).toBeInTheDocument();
  });

  it("ignores non-digit input", async () => {
    const user = userEvent.setup();
    render(<Harness rule={{ min: 1, step: 1 }} initial={2} />);
    const input = screen.getByLabelText("Quantity (chicks)");

    await user.clear(input);
    await user.type(input, "3a{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("3");
  });
});
