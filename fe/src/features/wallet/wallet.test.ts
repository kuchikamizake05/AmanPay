import { describe, expect, it } from "vitest";
import { Keypair, TransactionBuilder, Networks, Account } from "@stellar/stellar-sdk";

describe("Stellar Keypair & Signing Simulation", () => {
  it("generates valid random keypairs", () => {
    const keypair = Keypair.random();
    expect(keypair.publicKey()).toMatch(/^G[A-Z2-7]{55}$/);
    expect(keypair.secret()).toMatch(/^S[A-Z2-7]{55}$/);
  });

  it("restores keypair from secret key", () => {
    const original = Keypair.random();
    const secret = original.secret();
    const restored = Keypair.fromSecret(secret);

    expect(restored.publicKey()).toBe(original.publicKey());
  });

  it("signs XDR transaction envelopes locally", () => {
    const keypair = Keypair.random();
    const sourceAccount = new Account(keypair.publicKey(), "1");
    
    // Create a simple transaction
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    }).setTimeout(100).build();

    // Verify unsigned envelope doesn't throw and can be signed
    expect(tx.signatures.length).toBe(0);
    tx.sign(keypair);
    expect(tx.signatures.length).toBe(1);

    const signedXdr = tx.toXDR();
    expect(signedXdr).toBeDefined();

    // Verify it decodes back with signature intact
    const restoredTx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    expect(restoredTx.signatures.length).toBe(1);
  });
});
