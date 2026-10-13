import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { mainNav, quoteLink } from "@/config/site";

import { MobileNav } from "./mobile-nav";

function renderNav() {
  return render(
    <MemoryRouter initialEntries={["/about"]}>
      <MobileNav nav={mainNav} quote={quoteLink} />
    </MemoryRouter>,
  );
}

describe("MobileNav (SITE-01)", () => {
  it("opens the lazily loaded menu and lists every main link", async () => {
    const user = userEvent.setup();
    renderNav();
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    const dialog = await screen.findByRole("dialog");
    expect(button).toHaveAttribute("aria-expanded", "true");
    for (const link of mainNav) {
      expect(dialog).toContainElement(screen.getByRole("link", { name: link.label }));
    }
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });

  it("closes on Escape and returns focus to the menu button", async () => {
    const user = userEvent.setup();
    renderNav();
    const button = screen.getByRole("button", { name: "Open menu" });

    await user.click(button);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(button).toHaveFocus();
  });

  it("closes after choosing a link", async () => {
    const user = userEvent.setup();
    renderNav();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(await screen.findByRole("link", { name: "Shop" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
