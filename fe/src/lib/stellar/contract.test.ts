import { Address, StrKey, scValToNative } from "@stellar/stellar-sdk";
import { describe, expect, it } from "vitest";
import {
  createDealArgs,
  normalizeChainDeal,
  verifyMetadata,
  type ChainDeal,
} from "./codec";

describe("AmanPay contract encoding", () => {
  it("encodes create_deal arguments in Rust interface order", () => {
    const seller = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 1));
    const buyer = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 2));
    const resolver = StrKey.encodeEd25519PublicKey(Buffer.alloc(32, 3));
    const asset = Address.contract(Buffer.alloc(32, 7)).toString();
    const args = createDealArgs(
      {
        dealType: "Service",
        title: "Landing page",
        description: "Landing page tiga section",
        seller,
        buyer,
        resolver,
        asset,
        amount: "1.2345678",
        deliveryDeadline: "2026-07-01T10:00:00.000Z",
        reviewPeriodHours: 48,
        revisionLimit: 2,
        revisionPeriodHours: 24,
      },
      "11".repeat(32),
    );

    expect(args).toHaveLength(11);
    expect(scValToNative(args[0])).toEqual(["Service"]);
    expect(scValToNative(args[5])).toBe(12_345_678n);
    expect(scValToNative(args[8])).toBe(172_800n);
    expect(scValToNative(args[9])).toBe(2);
  });
});

describe("AmanPay contract decoding", () => {
  const chain: ChainDeal = {
    id: "7",
    dealType: "Service",
    status: "Created",
    seller: "GS",
    buyer: "GB",
    resolver: "GR",
    asset: "CA",
    amountStroops: "10",
    termsHash: "ab".repeat(32),
    deliveryDeadline: 20,
    reviewPeriodSeconds: 30,
    revisionLimit: 2,
    revisionCount: 0,
    createdAt: 1,
  };

  it("normalizes Soroban structs and enum representations", () => {
    expect(
      normalizeChainDeal({
        id: 7n,
        deal_type: ["Service"],
        status: { tag: "Created" },
        seller: "GS",
        buyer: "GB",
        resolver: "GR",
        asset: "CA",
        amount: 10n,
        terms_hash: Uint8Array.from([0xab, 0xcd]),
        delivery_deadline: 20n,
        review_period: 30n,
        revision_limit: 2,
        revision_count: 0,
        created_at: 1n,
      }),
    ).toMatchObject({
      id: "7",
      dealType: "Service",
      status: "Created",
      termsHash: "abcd",
    });

    expect(
      normalizeChainDeal({
        id: "8",
        deal_type: "Custom",
        status: "Cancelled",
        seller: "GS",
        buyer: "GB",
        resolver: "GR",
        asset: "CA",
        amount: "10",
        terms_hash: null,
        delivery_deadline: 20,
        review_period: 30,
        revision_limit: 0,
        revision_count: 0,
        created_at: 1,
      }),
    ).toMatchObject({ dealType: "Custom", status: "Cancelled", termsHash: "" });
  });

  it("rejects any metadata field that differs from chain state", () => {
    const metadata = {
      schemaVersion: 1 as const,
      network: "testnet" as const,
      contractId: "C",
      dealType: "Service" as const,
      title: "Deal",
      description: "Description",
      seller: "GS",
      buyer: "GB",
      resolver: "GR",
      asset: "CA",
      amountStroops: "10",
      deliveryDeadline: 20,
      reviewPeriodSeconds: 30,
      revisionLimit: 2,
      revisionPeriodSeconds: 30,
    };
    expect(verifyMetadata(chain, metadata, chain.termsHash)).toBe(true);
    expect(
      verifyMetadata(
        chain,
        { ...metadata, buyer: "ATTACKER" },
        chain.termsHash,
      ),
    ).toBe(false);
    expect(verifyMetadata(chain, metadata, "wrong")).toBe(false);
  });
});
