"use client";

import { useState } from "react";
import type { ChainDeal } from "@/lib/stellar/codec";
import { invokeDealAction } from "@/lib/stellar/contract";
import { useWallet } from "@/features/wallet/wallet-provider";
import { getAvailableActions, type DealAction } from "../model/lifecycle";
import {
  buildDeliveryProof,
  buildRevisionReason,
  buildDisputeReason,
  hashPrivateMetadata,
} from "../model/private-metadata";
import { LoaderCircle, CheckCircle2, ShieldAlert } from "lucide-react";

type ActionPanelProps = {
  deal: ChainDeal;
  termsHashVerified: boolean;
  onActionComplete: () => void;
};

export function ActionPanel({ deal, termsHashVerified, onActionComplete }: ActionPanelProps) {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [activeForm, setActiveForm] = useState<"delivery" | "revision" | "dispute" | null>(null);
  const [deliveryUrl, setDeliveryUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionEvidenceUrl, setRevisionEvidenceUrl] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeEvidenceUrl, setDisputeEvidenceUrl] = useState("");

  const now = Math.floor(Date.now() / 1_000);
  const availableActions = getAvailableActions(deal, wallet.address, now, termsHashVerified);

  if (!wallet.address) {
    return (
      <div className="action-card action-card--empty">
        <p>Hubungkan wallet Anda untuk berinteraksi dengan deal ini.</p>
      </div>
    );
  }

  if (availableActions.length === 0) {
    return (
      <div className="action-card action-card--empty">
        <p>Tidak ada aksi yang tersedia saat ini untuk wallet Anda.</p>
      </div>
    );
  }

  async function handlePostEvent(txHash: string, eventType: DealAction, payload?: any) {
    const res = await fetch(`/api/deals/${deal.id}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ txHash, eventType, payload }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal mencatat event ke database");
    }
  }

  async function executeAction(action: DealAction, params: {
    deliveryHash?: string;
    reasonHash?: string;
    opener?: string;
  } = {}, payload?: any) {
    setLoading(true);
    setError(null);
    try {
      const result = await invokeDealAction(
        action,
        deal.id,
        params,
        wallet.address!,
        wallet.signTransaction,
      );

      // Post event off-chain
      await handlePostEvent(result.txHash, action, payload);

      // Clean forms
      setActiveForm(null);
      setDeliveryUrl("");
      setDeliveryNote("");
      setRevisionReason("");
      setRevisionEvidenceUrl("");
      setDisputeReason("");
      setDisputeEvidenceUrl("");

      onActionComplete();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memproses transaksi");
    } finally {
      setLoading(false);
    }
  }

  // Action handlers
  async function handleFund() {
    if (!confirm("Konfirmasi pendanaan:\nAnda akan mengunci dana di escrow contract.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("fund");
  }

  async function handleCancel() {
    if (!confirm("Konfirmasi pembatalan:\nDeal yang belum didanai akan dibatalkan secara permanen.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("cancel");
  }

  async function handleApprove() {
    if (!confirm("Konfirmasi pelepasan dana:\nDana akan ditransfer secara langsung dan final ke wallet Seller.\nAksi ini tidak dapat dibatalkan.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("approve");
  }

  async function handleRefundTimeout() {
    if (!confirm("Klaim pengembalian dana:\nBatas waktu pengiriman sudah terlewati. Dana akan dikembalikan ke wallet Anda.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("refund_timeout");
  }

  async function handleReleaseTimeout() {
    if (!confirm("Klaim pelepasan dana:\nBatas waktu peninjauan (review) sudah terlewati. Dana akan dilepaskan ke Seller.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("release_timeout");
  }

  async function handleResolveRefund() {
    if (!confirm("Keputusan Resolver:\nDana akan dikembalikan seluruhnya ke Buyer.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("resolve_refund");
  }

  async function handleResolveRelease() {
    if (!confirm("Keputusan Resolver:\nDana akan ditransfer seluruhnya ke Seller.\nApakah Anda ingin melanjutkan?")) return;
    await executeAction("resolve_release");
  }

  async function handleSubmitDelivery(e: React.FormEvent) {
    e.preventDefault();
    if (!deliveryUrl.trim() || !deliveryNote.trim()) {
      setError("URL hasil kerja dan catatan wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const payload = buildDeliveryProof({
        dealId: deal.id,
        revisionNumber: deal.revisionCount + 1,
        url: deliveryUrl,
        note: deliveryNote,
        seller: wallet.address!,
        timestamp: Math.floor(Date.now() / 1_000),
      });

      const deliveryHash = await hashPrivateMetadata(payload);
      await executeAction("submit_delivery", { deliveryHash }, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses pengiriman");
      setLoading(false);
    }
  }

  async function handleSubmitRevision(e: React.FormEvent) {
    e.preventDefault();
    if (!revisionReason.trim()) {
      setError("Alasan revisi wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const payload = buildRevisionReason({
        dealId: deal.id,
        revisionNumber: deal.revisionCount + 1,
        reason: revisionReason,
        evidenceUrl: revisionEvidenceUrl || undefined,
        buyer: wallet.address!,
        timestamp: Math.floor(Date.now() / 1_000),
      });

      const reasonHash = await hashPrivateMetadata(payload);
      await executeAction("request_revision", { reasonHash }, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses revisi");
      setLoading(false);
    }
  }

  async function handleSubmitDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeReason.trim()) {
      setError("Alasan dispute wajib diisi");
      return;
    }
    setLoading(true);
    try {
      const payload = buildDisputeReason({
        dealId: deal.id,
        opener: wallet.address!,
        reason: disputeReason,
        evidenceUrl: disputeEvidenceUrl || undefined,
        timestamp: Math.floor(Date.now() / 1_000),
      });

      const reasonHash = await hashPrivateMetadata(payload);
      await executeAction("open_dispute", { opener: wallet.address!, reasonHash }, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses dispute");
      setLoading(false);
    }
  }

  async function handleMutualCancel() {
    await executeAction("mutual_cancel", { opener: wallet.address! });
  }

  return (
    <div className="action-card">
      <h2>Aksi Escrow</h2>

      {error && (
        <div className="action-error">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="action-loading">
          <LoaderCircle className="spin" />
          <span>Processing Stellar transaction... Please wait for on-chain confirmation.</span>
        </div>
      )}

      {!loading && !activeForm && (
        <div className="action-buttons">
          {availableActions.includes("fund") && (
            <button className="button button--primary" onClick={handleFund}>
              Accept & Fund Escrow
            </button>
          )}

          {availableActions.includes("cancel") && (
            <button className="button button--dark" onClick={handleCancel}>
              Cancel Deal (Unfunded)
            </button>
          )}

          {availableActions.includes("submit_delivery") && (
            <button className="button button--primary" onClick={() => setActiveForm("delivery")}>
              Submit Credentials / Delivery Proof
            </button>
          )}

          {availableActions.includes("approve") && (
            <button className="button button--primary" onClick={handleApprove}>
              Approve & Release Funds
            </button>
          )}

          {availableActions.includes("request_revision") && (
            <button className="button button--dark" onClick={() => setActiveForm("revision")}>
              Request Revision
            </button>
          )}

          {availableActions.includes("open_dispute") && (
            <button className="button button--dark" onClick={() => setActiveForm("dispute")}>
              Open Dispute
            </button>
          )}

          {availableActions.includes("mutual_cancel") && (
            <button
              className="button button--dark"
              style={{ borderColor: "rgba(239, 68, 68, 0.4)", color: "#f87171" }}
              onClick={handleMutualCancel}
            >
              {deal.cancelRequestedBy
                ? deal.cancelRequestedBy === wallet.address
                  ? "Awaiting Counterparty Confirmation"
                  : "Confirm Mutual Cancellation"
                : "Request Mutual Cancellation"}
            </button>
          )}

          {availableActions.includes("refund_timeout") && (
            <button className="button button--primary" onClick={handleRefundTimeout}>
              Claim Refund (Timeout)
            </button>
          )}

          {availableActions.includes("release_timeout") && (
            <button className="button button--primary" onClick={handleReleaseTimeout}>
              Claim Release (Review Timeout)
            </button>
          )}

          {availableActions.includes("resolve_refund") && (
            <button className="button button--primary" onClick={handleResolveRefund}>
              Resolve: Refund Buyer
            </button>
          )}

          {availableActions.includes("resolve_release") && (
            <button className="button button--primary" onClick={handleResolveRelease}>
              Resolve: Release to Seller
            </button>
          )}
        </div>
      )}

      {/* Forms */}
      {!loading && activeForm === "delivery" && (
        <form onSubmit={handleSubmitDelivery} className="action-form">
          <h3>Submit Credentials / Delivery Proof</h3>
          <div className="form-group">
            <label htmlFor="deliveryUrl">Encrypted URL / Access Link (Private)</label>
            <input
              id="deliveryUrl"
              type="url"
              placeholder="https://drive.google.com/... or https://github.com/..."
              value={deliveryUrl}
              onChange={(e) => setDeliveryUrl(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryNote">Transfer Notes & Account Instructions (Private)</label>
            <textarea
              id="deliveryNote"
              placeholder="Provide credentials, password reset instructions, or delivery details..."
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button button--primary">
              Submit Proof
            </button>
            <button type="button" className="button button--dark" onClick={() => setActiveForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && activeForm === "revision" && (
        <form onSubmit={handleSubmitRevision} className="action-form">
          <h3>Request Revision / Replacement</h3>
          <div className="form-group">
            <label htmlFor="revisionReason">Reason for Revision (Private)</label>
            <textarea
              id="revisionReason"
              placeholder="Explain invalid login, missing files, or requested adjustments..."
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="revisionEvidence">Supporting Evidence URL (Optional)</label>
            <input
              id="revisionEvidence"
              type="url"
              placeholder="https://screenshot.link/..."
              value={revisionEvidenceUrl}
              onChange={(e) => setRevisionEvidenceUrl(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button button--primary">
              Submit Revision Request
            </button>
            <button type="button" className="button button--dark" onClick={() => setActiveForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {!loading && activeForm === "dispute" && (
        <form onSubmit={handleSubmitDispute} className="action-form">
          <h3>Open Dispute (Arbitration)</h3>
          <div className="form-group">
            <label htmlFor="disputeReason">Dispute Chronology & Statement (Private)</label>
            <textarea
              id="disputeReason"
              placeholder="Explain transaction breach for the neutral resolver to inspect..."
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="disputeEvidence">Supporting Evidence URL (Optional)</label>
            <input
              id="disputeEvidence"
              type="url"
              placeholder="https://drive.google.com/..."
              value={disputeEvidenceUrl}
              onChange={(e) => setDisputeEvidenceUrl(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="button button--primary">
              Submit Dispute
            </button>
            <button type="button" className="button button--dark" onClick={() => setActiveForm(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
