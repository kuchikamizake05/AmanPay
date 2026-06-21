import { describe, expect, it } from "vitest";
import { formatShareMessage } from "../components/public-receipt";

describe("Receipt Message Formatter", () => {
  it("formats share messages correctly for Released status", () => {
    const message = formatShareMessage(
      "Web design landing page",
      "50.00",
      "USDC",
      "12",
      "Released",
      "https://amanpay.co"
    );

    expect(message).toContain("⚡ AmanPay Escrow Receipt: Deal #0012 sukses diselesaikan!");
    expect(message).toContain("Judul: Web design landing page");
    expect(message).toContain("Nominal: 50.00 USDC");
    expect(message).toContain("Status: ✅ RELEASED (Dana Dirilis)");
    expect(message).toContain("https://amanpay.co/deals/12/receipt");
  });

  it("formats share messages correctly for Refunded status", () => {
    const message = formatShareMessage(
      "Logo design pack",
      "100.5",
      "XLM",
      "45",
      "Refunded",
      "https://amanpay.co"
    );

    expect(message).toContain("⚡ AmanPay Escrow Receipt: Deal #0045 sukses diselesaikan!");
    expect(message).toContain("Judul: Logo design pack");
    expect(message).toContain("Nominal: 100.5 XLM");
    expect(message).toContain("Status: ↩️ REFUNDED (Dana Dikembalikan)");
    expect(message).toContain("https://amanpay.co/deals/45/receipt");
  });
});
