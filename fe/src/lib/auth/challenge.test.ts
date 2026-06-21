import { Keypair } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import { buildAuthChallenge, verifyAuthChallenge } from "./challenge";

describe("wallet auth challenge", () => {
  const signer = Keypair.fromRawEd25519Seed(Buffer.alloc(32, 9));

  it("accepts exact signed challenge", () => {
    const challenge = buildAuthChallenge({
      wallet: signer.publicKey(),
      sequence: "10",
      nonce: "nonce-123",
      now: 1_000,
      expiresAt: 1_300,
    });
    challenge.sign(signer);
    expect(
      verifyAuthChallenge({
        signedXdr: challenge.toXDR(),
        wallet: signer.publicKey(),
        nonce: "nonce-123",
        now: 1_100,
        expiresAt: 1_300,
      }),
    ).toBe(true);
  });

  it("rejects tampering, wrong signer, and expiry", () => {
    const challenge = buildAuthChallenge({
      wallet: signer.publicKey(),
      sequence: "10",
      nonce: "nonce-123",
      now: 1_000,
      expiresAt: 1_300,
    });
    challenge.sign(Keypair.fromRawEd25519Seed(Buffer.alloc(32, 8)));
    expect(() =>
      verifyAuthChallenge({
        signedXdr: challenge.toXDR(),
        wallet: signer.publicKey(),
        nonce: "nonce-123",
        now: 1_100,
        expiresAt: 1_300,
      }),
    ).toThrow("Signature challenge tidak valid");
    expect(() =>
      verifyAuthChallenge({
        signedXdr: challenge.toXDR(),
        wallet: signer.publicKey(),
        nonce: "tampered",
        now: 1_301,
        expiresAt: 1_300,
      }),
    ).toThrow("Challenge sudah kedaluwarsa");
  });
});
