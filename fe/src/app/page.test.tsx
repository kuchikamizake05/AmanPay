import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Home from "./page";

vi.mock("@/features/landing/components/interactive-backdrop", () => ({
  InteractiveBackdrop: () => <div data-testid="interactive-backdrop" />,
}));

vi.mock("@/features/landing/components/lifecycle-preview", () => ({
  LifecyclePreview: () => <div data-testid="lifecycle-preview" />,
}));

describe("Home", () => {
  it("renders factual marquee, closing CTA, and landing footer", () => {
    render(<Home />);

    expect(screen.getByLabelText("AmanPay escrow guarantees")).toBeVisible();
    expect(screen.getAllByText("Immutable Terms Hash")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: /make next deal clear/i })).toBeVisible();
    expect(screen.getAllByRole("link", { name: /create secure deal/i })[1]).toHaveAttribute(
      "href",
      "/deals/new",
    );
    expect(screen.getByRole("link", { name: /see product proof/i })).toHaveAttribute("href", "/proof");
    expect(screen.getByRole("navigation", { name: /footer navigation/i })).toBeVisible();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});
