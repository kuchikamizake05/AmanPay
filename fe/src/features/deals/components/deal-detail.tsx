"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
  ShieldAlert,
  Share2,
} from "lucide-react";
import type { ChainDeal } from "@/lib/stellar/codec";
import { stellarConfig } from "@/config/stellar";
import type { CanonicalDealTerms } from "../model/metadata";
import { estimateIdrValue } from "../model/terms";
import { DealStatusBadge } from "./deal-status";
import { ActionPanel } from "./action-panel";
import { Timeline } from "./timeline";
import { Countdown } from "./countdown";

type Payload = {
  chain: ChainDeal;
  metadata: CanonicalDealTerms | null;
  txHash: string | null;
  termsHashVerified: boolean;
  timeline: any[];
  privateData: {
    deliveries: any[];
    privateNotes: any[];
  } | null;
  stateMismatch: boolean;
  sessionWallet: string | null;
};

const short = (value: string) => `${value.slice(0, 7)}…${value.slice(-5)}`;

export function DealDetail({ id }: { id: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const response = await fetch(`/api/deals/${id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (isMounted) {
          setPayload(data);
        }
      } catch (cause: any) {
        if (isMounted) setError(cause.message);
      }
    }

    loadData();

    // Auto-polling every 6 seconds if deal is in active non-terminal state
    const interval = setInterval(() => {
      loadData();
    }, 6_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  if (error)
    return (
      <div className="empty-state">
        <h2>Deal cannot be loaded</h2>
        <p>{error}</p>
        <Link href="/">Return to home</Link>
      </div>
    );

  if (!payload)
    return (
      <div className="loading-state">
        <LoaderCircle className="spin" /> Verifying escrow on Stellar Testnet…
      </div>
    );

  const { chain, metadata } = payload;

  return (
    <>
      {payload.stateMismatch && (
        <div className="mismatch-banner">
          <ShieldAlert size={16} />
          <span>Blockchain state updated externally. Synchronizing state...</span>
        </div>
      )}

      <div className="deal-detail">
        <div className="deal-detail__main">
          <div className="deal-kicker">
            <span>DEAL #{chain.id.padStart(4, "0")}</span>
            {payload.termsHashVerified ? (
              <span className="verified">
                <CheckCircle2 size={15} /> Terms Hash Verified
              </span>
            ) : null}
          </div>
          <h1>{metadata?.title ?? `${chain.dealType} deal`}</h1>
          <p className="deal-description">
            {metadata?.description ??
              "Off-chain metadata not loaded. On-chain escrow state remains fully verifiable."}
          </p>
          <DealStatusBadge status={chain.status} showDescription />

          {(chain.status === "Released" || chain.status === "Refunded") && (
            <div className="bg-[#116149]/10 border border-[#116149]/30 rounded-lg p-4 my-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#116149] text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Transaction Settled
                </h4>
                <p className="text-xs text-[#667068] mt-0.5">
                  Official on-chain settlement receipt has been published for this deal.
                </p>
              </div>
              <Link
                href={`/deals/${id}/receipt`}
                className="button button--primary button--small text-xs py-2 px-4 whitespace-nowrap cursor-pointer"
              >
                View Public Receipt
              </Link>
            </div>
          )}

          {/* Countdown timers */}
          {(chain.status === "Funded" || chain.status === "RevisionRequested") && (
            <Countdown deadline={chain.deliveryDeadline} label="Time remaining for delivery" />
          )}

          {chain.status === "Delivered" && chain.reviewDeadline !== null && (
            <Countdown deadline={chain.reviewDeadline} label="Time remaining for review/approval" />
          )}

          <section className="detail-section">
            <h2>Deal Parties</h2>
            <div className="party-grid">
              <article>
                <small>SELLER</small>
                <Link href={`/profiles/${chain.seller}`} className="hover:text-[#116149] transition-colors">
                  <b className="underline decoration-dotted cursor-pointer">{short(chain.seller)}</b>
                </Link>
                <span>Deal Creator</span>
              </article>
              <article>
                <small>BUYER</small>
                <Link href={`/profiles/${chain.buyer}`} className="hover:text-[#116149] transition-colors">
                  <b className="underline decoration-dotted cursor-pointer">{short(chain.buyer)}</b>
                </Link>
                <span>Funding Party</span>
              </article>
              <article>
                <small>RESOLVER</small>
                <b>{short(chain.resolver)}</b>
                <span>Arbitrator (Dispute only)</span>
              </article>
            </div>
          </section>

          {/* Private payloads display */}
          {payload.privateData && (
            <section className="detail-section">
              <h2>Private Credentials & Delivery Proofs</h2>
              {payload.privateData.deliveries.length === 0 &&
                payload.privateData.privateNotes.length === 0 && (
                  <p className="summary-note">No private files or statements submitted yet.</p>
                )}

              {/* Private Deliveries */}
              {payload.privateData.deliveries.map((d: any) => (
                <div key={d.id} className="private-delivery-card">
                  <h3>Seller Delivery (Revision #{d.revision})</h3>
                  <dl>
                    <dt>Delivery URL</dt>
                    <dd>
                      <a href={d.private_url} target="_blank" rel="noreferrer">
                        {d.private_url} <ExternalLink size={12} style={{ display: "inline" }} />
                      </a>
                    </dd>
                    <dt>Notes</dt>
                    <dd>{d.private_note}</dd>
                    <dt>Sender</dt>
                    <dd><code>{short(d.submitter)}</code></dd>
                    <dt>Timestamp</dt>
                    <dd>{new Date(d.created_at).toLocaleString()}</dd>
                  </dl>
                </div>
              ))}

              {/* Private Notes */}
              {payload.privateData.privateNotes.map((n: any) => (
                <div
                  key={n.id}
                  className="private-delivery-card"
                  style={{
                    borderLeftColor: n.note_type === "dispute_reason" ? "var(--red)" : "var(--amber)",
                  }}
                >
                  <h3>
                    {n.note_type === "dispute_reason" ? "Dispute Statement" : `Revision Request #${n.revision_number}`}
                  </h3>
                  <dl>
                    <dt>Reason</dt>
                    <dd>{n.reason}</dd>
                    {n.evidence_url && (
                      <>
                        <dt>Evidence URL</dt>
                        <dd>
                          <a href={n.evidence_url} target="_blank" rel="noreferrer">
                            {n.evidence_url} <ExternalLink size={12} style={{ display: "inline" }} />
                          </a>
                        </dd>
                      </>
                    )}
                    <dt>By</dt>
                    <dd>
                      <code>{short(n.opener || n.buyer || "")}</code>
                    </dd>
                    <dt>Timestamp</dt>
                    <dd>{new Date(n.created_at).toLocaleString()}</dd>
                  </dl>
                </div>
              ))}
            </section>
          )}

          <section className="detail-section blockchain-box">
            <div>
              <ShieldCheck />
              <h2>Blockchain Proof</h2>
            </div>
            <dl>
              <dt>Terms Hash</dt>
              <dd>
                {short(chain.termsHash)}{" "}
                <button
                  aria-label="Copy terms hash"
                  onClick={() => navigator.clipboard.writeText(chain.termsHash)}
                >
                  <Copy size={14} />
                </button>
              </dd>
              <dt>Contract Deal ID</dt>
              <dd>{chain.id}</dd>
              <dt>Network</dt>
              <dd>Stellar Testnet</dd>
            </dl>
            {payload.txHash ? (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${payload.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                View On-Chain Tx <ExternalLink size={14} />
              </a>
            ) : null}
          </section>

          {/* Action Panel */}
          <ActionPanel
            deal={chain}
            termsHashVerified={payload.termsHashVerified}
            onActionComplete={refetch}
          />

          {/* Timeline */}
          <Timeline events={payload.timeline} />
        </div>

        <aside className="deal-summary">
          <p>Deal Value</p>
          <strong>
            {(Number(chain.amountStroops) / 10_000_000).toLocaleString("en-US", {
              maximumFractionDigits: 7,
            })}
          </strong>
          <span>
            {stellarConfig.assets.find(
              (asset) => asset.contractId === chain.asset,
            )?.code ?? "USDC"}
          </span>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            ≈ {estimateIdrValue(
              (Number(chain.amountStroops) / 10_000_000).toString(),
              stellarConfig.assets.find((asset) => asset.contractId === chain.asset)?.code ?? "USDC"
            )}
          </p>
          <hr />
          <dl>
            <dt>Deadline</dt>
            <dd>
              {new Date(chain.deliveryDeadline * 1_000).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
            <dt>Review Period</dt>
            <dd>{chain.reviewPeriodSeconds / 3_600} hours</dd>
            <dt>Revisions</dt>
            <dd>
              {chain.revisionCount} / {chain.revisionLimit}
            </dd>
          </dl>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `AmanPay Escrow Update for Deal #${chain.id} (${metadata?.title ?? "Digital Deal"}): Status is now *${chain.status}*. Verify here: ${typeof window !== "undefined" ? window.location.href : ""}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-4 text-xs font-semibold rounded bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/30 cursor-pointer"
          >
            <Share2 size={13} /> Update via WhatsApp / Messenger
          </a>

          <p className="summary-note">
            <ShieldCheck size={16} /> Non-custodial escrow on Stellar Soroban.
          </p>
        </aside>
      </div>
    </>
  );
}
