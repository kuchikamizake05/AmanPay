import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteractiveBackdrop } from "./interactive-backdrop";

describe("InteractiveBackdrop", () => {
  it("renders decorative ledger grid", () => {
    const { container } = render(<InteractiveBackdrop />);
    const backdrop = container.firstElementChild as HTMLElement;

    expect(backdrop).toHaveAttribute("aria-hidden", "true");
    expect(backdrop.querySelector("#hero-ledger-grid")).toBeInTheDocument();
    expect(backdrop.querySelectorAll(".grid-tile").length).toBeGreaterThan(0);
  });
});
