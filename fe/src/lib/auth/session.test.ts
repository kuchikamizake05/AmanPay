import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "./session";

describe("signed wallet session", () => {
  it("round-trips wallet and expiry", () => {
    const token = createSessionToken({ wallet: "GTEST", expiresAt: 2_000 }, "secret-32-characters-minimum-value");
    expect(verifySessionToken(token, "secret-32-characters-minimum-value", 1_500)).toEqual({
      wallet: "GTEST",
      expiresAt: 2_000,
    });
  });

  it("rejects tampered and expired tokens", () => {
    const token = createSessionToken({ wallet: "GTEST", expiresAt: 2_000 }, "secret-32-characters-minimum-value");
    expect(() => verifySessionToken(`${token}x`, "secret-32-characters-minimum-value", 1_500)).toThrow();
    expect(() => verifySessionToken(token, "secret-32-characters-minimum-value", 2_001)).toThrow(
      "Session sudah kedaluwarsa",
    );
  });
});
