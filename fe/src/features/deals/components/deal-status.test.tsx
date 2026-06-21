import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DealStatusBadge } from "./deal-status";

describe("DealStatusBadge", () => {
  it("shows user-facing escrow status and explanation", () => {
    render(<DealStatusBadge status="Funded" showDescription />);
    expect(screen.getByText("Dana terkunci")).toBeVisible();
    expect(screen.getByText(/Seller dapat mulai/)).toBeVisible();
  });
});
