import { describe, expect, it } from "vitest";
import { parseTextWithRegex } from "./parser";

describe("Rule-based AI Deal Parser", () => {
  it("parses service templates", () => {
    const text = "Bikin landing page 3 section, deadline 5 hari, harga 500 ribu, revisi maksimal 2x, final file dikirim via GitHub.";
    const result = parseTextWithRegex(text);

    expect(result.dealType).toBe("Service");
    expect(result.title).toBe("Landing page 3 section");
    expect(result.amount).toBe("500000");
    expect(result.deadlineDays).toBe(5);
    expect(result.revisionLimit).toBe(2);
    expect(result.deliverable).toContain("GitHub");
  });

  it("parses digital goods templates", () => {
    const text = "Aku mau beli template Notion finance tracker harga 150 ribu. Seller kirim link Google Drive setelah aku bayar.";
    const result = parseTextWithRegex(text);

    expect(result.dealType).toBe("DigitalGoods");
    expect(result.title).toBe("Template Notion finance tracker");
    expect(result.amount).toBe("150000");
    expect(result.revisionLimit).toBe(0);
    expect(result.deliverable).toContain("Google Drive");
  });

  it("uses intelligent defaults", () => {
    const text = "buat website portfolio";
    const result = parseTextWithRegex(text);

    expect(result.dealType).toBe("Service");
    expect(result.title).toBe("Website portfolio");
    expect(result.amount).toBe("500000"); // default service amount
    expect(result.deadlineDays).toBe(3); // default days
  });
});
