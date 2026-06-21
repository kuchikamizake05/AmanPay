import { describe, expect, it } from "vitest";
import {
  buildDeliveryProof,
  buildDisputeReason,
  buildRevisionReason,
  hashPrivateMetadata,
} from "./private-metadata";

describe("private deal metadata", () => {
  it("builds deterministic delivery payload", async () => {
    const payload = buildDeliveryProof({
      dealId: "7",
      revisionNumber: 1,
      url: "https://drive.example/final",
      note: "Final build",
      seller: "GSELLER",
      timestamp: 1_700_000_000,
    });
    expect(payload.schemaVersion).toBe(1);
    expect(payload.kind).toBe("delivery");
    await expect(hashPrivateMetadata(payload)).resolves.toMatch(/^[0-9a-f]{64}$/);
  });

  it("normalizes optional evidence URLs", () => {
    expect(
      buildRevisionReason({
        dealId: "7",
        revisionNumber: 1,
        reason: "Warna belum sesuai",
        evidenceUrl: "",
        buyer: "GBUYER",
        timestamp: 1,
      }).evidenceUrl,
    ).toBeNull();
    expect(
      buildDisputeReason({
        dealId: "7",
        opener: "GBUYER",
        reason: "File tidak dapat dibuka",
        evidenceUrl: "https://example.test/evidence",
        timestamp: 2,
      }).kind,
    ).toBe("dispute");
  });
});
