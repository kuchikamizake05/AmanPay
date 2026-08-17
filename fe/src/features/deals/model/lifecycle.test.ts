import { describe, expect, it } from "vitest";
import { getAvailableActions } from "./lifecycle";
import type { ChainDeal } from "@/lib/stellar/codec";

const deal: ChainDeal = {
  id: "1",
  dealType: "Service",
  status: "Created",
  seller: "GSELLER",
  buyer: "GBUYER",
  resolver: "GRESOLVER",
  asset: "CASSET",
  amountStroops: "100",
  termsHash: "ab".repeat(32),
  deliveryHash: null,
  disputeHash: null,
  deliveryDeadline: 2_000,
  reviewDeadline: null,
  reviewPeriodSeconds: 100,
  revisionLimit: 2,
  revisionCount: 0,
  cancelRequestedBy: null,
  createdAt: 1_000,
};

describe("deal lifecycle actions", () => {
  it("gates created deal actions by role and verified terms", () => {
    expect(getAvailableActions(deal, "GBUYER", 1_500, true)).toEqual(["fund"]);
    expect(getAvailableActions(deal, "GBUYER", 1_500, false)).toEqual([]);
    expect(getAvailableActions(deal, "GSELLER", 1_500, true)).toEqual(["cancel"]);
  });

  it("offers permissionless refund only after deadline", () => {
    const funded = { ...deal, status: "Funded" as const };
    expect(getAvailableActions(funded, "GOUTSIDER", 2_000, true)).toEqual([]);
    expect(getAvailableActions(funded, "GOUTSIDER", 2_001, true)).toEqual(["refund_timeout"]);
  });

  it("supports delivery, dispute, revision, approve, mutual cancel, and review timeout", () => {
    expect(getAvailableActions({ ...deal, status: "Funded" }, "GSELLER", 1_500, true)).toEqual([
      "submit_delivery",
      "open_dispute",
      "mutual_cancel",
    ]);
    const delivered = { ...deal, status: "Delivered" as const, reviewDeadline: 1_800 };
    expect(getAvailableActions(delivered, "GBUYER", 1_700, true)).toEqual([
      "approve",
      "request_revision",
      "open_dispute",
      "mutual_cancel",
    ]);
    expect(getAvailableActions(delivered, "GOUTSIDER", 1_801, true)).toEqual(["release_timeout"]);
  });

  it("lets resolver close disputes and final states expose no action", () => {
    expect(getAvailableActions({ ...deal, status: "Disputed" }, "GRESOLVER", 1_500, true)).toEqual([
      "resolve_refund",
      "resolve_release",
    ]);
    expect(getAvailableActions({ ...deal, status: "Released" }, "GBUYER", 1_500, true)).toEqual([]);
  });
});
