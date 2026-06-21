import type { DealInput } from "./deal";
import { parseAmountToStroops, type CanonicalValue } from "./terms";

export type CanonicalDealTerms = {
  schemaVersion: 1;
  network: "testnet";
  contractId: string;
  dealType: DealInput["dealType"];
  title: string;
  description: string;
  seller: string;
  buyer: string;
  resolver: string;
  asset: string;
  amountStroops: string;
  deliveryDeadline: number;
  reviewPeriodSeconds: number;
  revisionLimit: number;
  revisionPeriodSeconds: number;
};

export function buildCanonicalTerms(
  input: DealInput,
  context: { contractId: string; network: "testnet" },
): CanonicalDealTerms {
  return {
    schemaVersion: 1,
    network: context.network,
    contractId: context.contractId,
    dealType: input.dealType,
    title: input.title.trim(),
    description: input.description.trim(),
    seller: input.seller,
    buyer: input.buyer,
    resolver: input.resolver,
    asset: input.asset,
    amountStroops: parseAmountToStroops(input.amount).toString(),
    deliveryDeadline: Math.floor(
      new Date(input.deliveryDeadline).getTime() / 1_000,
    ),
    reviewPeriodSeconds: input.reviewPeriodHours * 3_600,
    revisionLimit: input.revisionLimit,
    revisionPeriodSeconds: input.revisionPeriodHours * 3_600,
  };
}

export function asCanonicalValue(terms: CanonicalDealTerms): CanonicalValue {
  return terms as unknown as CanonicalValue;
}
