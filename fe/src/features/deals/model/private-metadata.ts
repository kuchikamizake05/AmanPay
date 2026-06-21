import { hashTerms, type CanonicalValue } from "./terms";

type DeliveryInput = {
  dealId: string;
  revisionNumber: number;
  url: string;
  note: string;
  seller: string;
  timestamp: number;
};

type RevisionInput = {
  dealId: string;
  revisionNumber: number;
  reason: string;
  evidenceUrl?: string;
  buyer: string;
  timestamp: number;
};

type DisputeInput = {
  dealId: string;
  opener: string;
  reason: string;
  evidenceUrl?: string;
  timestamp: number;
};

const optionalUrl = (value?: string) => value?.trim() || null;

export function buildDeliveryProof(input: DeliveryInput) {
  return {
    schemaVersion: 1 as const,
    kind: "delivery" as const,
    dealId: input.dealId,
    revisionNumber: input.revisionNumber,
    url: input.url.trim(),
    note: input.note.trim(),
    seller: input.seller,
    timestamp: input.timestamp,
  };
}

export function buildRevisionReason(input: RevisionInput) {
  return {
    schemaVersion: 1 as const,
    kind: "revision" as const,
    dealId: input.dealId,
    revisionNumber: input.revisionNumber,
    reason: input.reason.trim(),
    evidenceUrl: optionalUrl(input.evidenceUrl),
    buyer: input.buyer,
    timestamp: input.timestamp,
  };
}

export function buildDisputeReason(input: DisputeInput) {
  return {
    schemaVersion: 1 as const,
    kind: "dispute" as const,
    dealId: input.dealId,
    opener: input.opener,
    reason: input.reason.trim(),
    evidenceUrl: optionalUrl(input.evidenceUrl),
    timestamp: input.timestamp,
  };
}

export function hashPrivateMetadata(payload: object) {
  return hashTerms(payload as CanonicalValue);
}
