import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProductProofPage, { metadata } from "./page";

describe("ProductProofPage", () => {
  it("explains evidence without fabricated testimonials", () => {
    render(<ProductProofPage />);

    expect(screen.getByText("Product Proof")).toBeVisible();
    expect(screen.getByText("No placeholder testimonials.")).toBeVisible();
    expect(screen.getByText(/does not publish invented reviews/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /create testnet deal/i })).toHaveAttribute(
      "href",
      "/deals/new",
    );
  });

  it("sets proof page metadata", () => {
    expect(metadata.title).toBe("Product Proof | AmanPay");
  });
});
