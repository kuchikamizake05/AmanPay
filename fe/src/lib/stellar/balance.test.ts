import { describe, expect, it } from "vitest";
import { nativeBalanceFromAccount } from "./balance";

describe("nativeBalanceFromAccount", () => {
  it("returns native XLM balance", () => {
    expect(
      nativeBalanceFromAccount({
        balances: [
          { asset_type: "credit_alphanum4", balance: "5.0000000" },
          { asset_type: "native", balance: "123.4567890" },
        ],
      }),
    ).toBe("123.4567890");
  });

  it("rejects accounts without native XLM", () => {
    expect(() => nativeBalanceFromAccount({ balances: [] })).toThrow(
      "Native XLM balance not found",
    );
  });
});
