import type { ChainDeal } from "@/lib/stellar/codec";

export type DealAction =
  | "fund"
  | "cancel"
  | "submit_delivery"
  | "approve"
  | "request_revision"
  | "open_dispute"
  | "mutual_cancel"
  | "refund_timeout"
  | "release_timeout"
  | "resolve_refund"
  | "resolve_release";

export function getAvailableActions(
  deal: ChainDeal,
  wallet: string | null,
  now: number,
  termsHashVerified: boolean,
): DealAction[] {
  if (!wallet) return [];

  if (deal.status === "Created") {
    if (wallet === deal.seller) return ["cancel"];
    if (wallet === deal.buyer && termsHashVerified && now <= deal.deliveryDeadline) return ["fund"];
    return [];
  }

  if (deal.status === "Funded" || deal.status === "RevisionRequested") {
    if (now > deal.deliveryDeadline) return ["refund_timeout"];
    const actions: DealAction[] = [];
    if (wallet === deal.seller) {
      actions.push("submit_delivery", "open_dispute", "mutual_cancel");
    } else if (wallet === deal.buyer) {
      actions.push("open_dispute", "mutual_cancel");
    }
    return actions;
  }

  if (deal.status === "Delivered") {
    if (deal.reviewDeadline !== null && now > deal.reviewDeadline) return ["release_timeout"];
    if (wallet === deal.buyer) {
      const actions: DealAction[] = ["approve"];
      if (deal.revisionCount < deal.revisionLimit) actions.push("request_revision");
      actions.push("open_dispute", "mutual_cancel");
      return actions;
    }
    if (wallet === deal.seller) return ["open_dispute", "mutual_cancel"];
    return [];
  }

  if (deal.status === "Disputed" && wallet === deal.resolver) {
    return ["resolve_refund", "resolve_release"];
  }
  return [];
}
