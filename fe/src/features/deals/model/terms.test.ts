import { describe, expect, it } from "vitest";
import { canonicalizeTerms, hashTerms, parseAmountToStroops } from "./terms";

describe("deal terms", () => {
  it("converts seven-decimal asset amounts without floating-point math", () => {
    expect(parseAmountToStroops("500000")).toBe(5_000_000_000_000n);
    expect(parseAmountToStroops("1.2345678")).toBe(12_345_678n);
    expect(() => parseAmountToStroops("1.23456789")).toThrow("Maksimal 7 angka desimal");
    expect(() => parseAmountToStroops("0")).toThrow("Nominal harus lebih dari 0");
  });

  it("serializes recursively with stable key order", () => {
    expect(canonicalizeTerms({ z: 1, nested: { b: true, a: "aman" }, a: 2 })).toBe(
      '{"a":2,"nested":{"a":"aman","b":true},"z":1}',
    );
  });

  it("produces deterministic lowercase SHA-256", async () => {
    await expect(hashTerms({ seller: "GA", amountStroops: "10" })).resolves.toBe(
      "faad7b95ea9df62755b11865be78cf1c331e71d6dc45d6502a60cb029575a12e",
    );
  });
});
