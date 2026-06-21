import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { Buffer } from "buffer";
import type {
  DealInput,
  DealStatus,
  DealType,
} from "@/features/deals/model/deal";
import type { CanonicalDealTerms } from "@/features/deals/model/metadata";
import { parseAmountToStroops } from "@/features/deals/model/terms";

function enumScVal(value: string) {
  return xdr.ScVal.scvVec([nativeToScVal(value, { type: "symbol" })]);
}

function bytes32ScVal(hex: string) {
  if (!/^[0-9a-f]{64}$/i.test(hex)) throw new Error("Terms hash tidak valid");
  return xdr.ScVal.scvBytes(Buffer.from(hex, "hex"));
}

export function createDealArgs(
  input: DealInput,
  termsHash: string,
): xdr.ScVal[] {
  return [
    enumScVal(input.dealType),
    new Address(input.seller).toScVal(),
    new Address(input.buyer).toScVal(),
    new Address(input.resolver).toScVal(),
    new Address(input.asset).toScVal(),
    nativeToScVal(parseAmountToStroops(input.amount), { type: "i128" }),
    bytes32ScVal(termsHash),
    nativeToScVal(
      BigInt(Math.floor(new Date(input.deliveryDeadline).getTime() / 1_000)),
      { type: "u64" },
    ),
    nativeToScVal(BigInt(input.reviewPeriodHours * 3_600), { type: "u64" }),
    nativeToScVal(input.revisionLimit, { type: "u32" }),
    nativeToScVal(BigInt(input.revisionPeriodHours * 3_600), { type: "u64" }),
  ];
}

function enumTag(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return String(value[0]);
  if (value && typeof value === "object" && "tag" in value)
    return String(value.tag);
  return String(value);
}

function hexBytes(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Uint8Array)
    return Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("");
  return String(value);
}

export type ChainDeal = {
  id: string;
  dealType: DealType;
  status: DealStatus;
  seller: string;
  buyer: string;
  resolver: string;
  asset: string;
  amountStroops: string;
  termsHash: string;
  deliveryDeadline: number;
  reviewPeriodSeconds: number;
  revisionLimit: number;
  revisionCount: number;
  createdAt: number;
};

export function normalizeChainDeal(value: Record<string, unknown>): ChainDeal {
  return {
    id: String(value.id),
    dealType: enumTag(value.deal_type) as DealType,
    status: enumTag(value.status) as DealStatus,
    seller: String(value.seller),
    buyer: String(value.buyer),
    resolver: String(value.resolver),
    asset: String(value.asset),
    amountStroops: String(value.amount),
    termsHash: hexBytes(value.terms_hash) ?? "",
    deliveryDeadline: Number(value.delivery_deadline),
    reviewPeriodSeconds: Number(value.review_period),
    revisionLimit: Number(value.revision_limit),
    revisionCount: Number(value.revision_count),
    createdAt: Number(value.created_at),
  };
}

export function verifyMetadata(
  chain: ChainDeal,
  metadata: CanonicalDealTerms,
  termsHash: string,
) {
  return (
    chain.termsHash === termsHash &&
    chain.seller === metadata.seller &&
    chain.buyer === metadata.buyer &&
    chain.resolver === metadata.resolver &&
    chain.asset === metadata.asset &&
    chain.amountStroops === metadata.amountStroops
  );
}
