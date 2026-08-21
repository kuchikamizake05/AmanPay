import { describe, expect, it } from "vitest";
import { Keypair } from "@stellar/stellar-sdk";
import { validateNativePayment } from "./payment";

const recipient = Keypair.random().publicKey();

describe("validateNativePayment", () => {
  it("accepts a Stellar account and seven-decimal XLM amount", () => {
    expect(() => validateNativePayment(recipient, "1.2345678")).not.toThrow();
  });

  it("rejects invalid recipients and amounts", () => {
    expect(() => validateNativePayment("not-a-wallet", "1")).toThrow(
      "Recipient must be a valid Stellar public key",
    );
    expect(() => validateNativePayment(recipient, "0")).toThrow(
      "Amount must be greater than 0",
    );
    expect(() => validateNativePayment(recipient, "1.23456789")).toThrow(
      "Amount must be greater than 0",
    );
  });
});
