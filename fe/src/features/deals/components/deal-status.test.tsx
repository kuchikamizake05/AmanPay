import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DealStatusBadge } from "./deal-status";

describe("DealStatusBadge", () => {
  it("shows user-facing escrow status and explanation", () => {
    render(<DealStatusBadge status="Funded" showDescription />);
    expect(screen.getByText("Escrow Locked")).toBeVisible();
    expect(screen.getByText(/Seller can fulfill/)).toBeVisible();
  });

  it("can render compact status without explanation", () => {
    render(<DealStatusBadge status="Released" />);
    expect(screen.getByText("Funds Released")).toBeVisible();
    expect(screen.queryByText(/Deal successfully settled/)).not.toBeInTheDocument();
  });
});
