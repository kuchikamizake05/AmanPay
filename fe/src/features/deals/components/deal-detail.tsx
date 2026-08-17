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
        <h2>Deal belum bisa dibuka</h2>
        <p>{error}</p>
        <Link href="/">Kembali ke beranda</Link>
      </div>
    );

  if (!payload)
    return (
      <div className="loading-state">
        <LoaderCircle className="spin" /> Membaca bukti dari Stellar…
      </div>
    );

  const { chain, metadata } = payload;

  return (
    <>
      {payload.stateMismatch && (
        <div className="mismatch-banner">
          <ShieldAlert size={16} />
          <span>Status di blockchain telah berubah di luar aplikasi. Data sedang disinkronisasikan.</span>
        </div>
      )}

      <div className="deal-detail">
        <div className="deal-detail__main">
          <div className="deal-kicker">
            <span>DEAL #{chain.id.padStart(4, "0")}</span>
            {payload.termsHashVerified ? (
              <span className="verified">
                <CheckCircle2 size={15} /> Terms terverifikasi
              </span>
            ) : null}
          </div>
          <h1>{metadata?.title ?? `${chain.dealType} deal`}</h1>
          <p className="deal-description">
            {metadata?.description ??
              "Metadata off-chain belum tersedia. Data escrow tetap dapat diverifikasi."}
          </p>
          <DealStatusBadge status={chain.status} showDescription />

          {(chain.status === "Released" || chain.status === "Refunded") && (
            <div className="bg-[#116149]/10 border border-[#116149]/30 rounded-lg p-4 my-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-[#116149] text-sm flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Transaksi Selesai
                </h4>
                <p className="text-xs text-[#667068] mt-0.5">
                  Resi publik resmi on-chain telah diterbitkan untuk deal ini.
                </p>
              </div>
              <Link
                href={`/deals/${id}/receipt`}
                className="button button--primary button--small text-xs py-2 px-4 whitespace-nowrap cursor-pointer"
              >
                Buka Resi Publik
              </Link>
            </div>
          )}

          {/* Countdown timers */}
          {(chain.status === "Funded" || chain.status === "RevisionRequested") && (
            <Countdown deadline={chain.deliveryDeadline} label="Sisa waktu pengiriman pekerjaan" />
          )}

          {chain.status === "Delivered" && chain.reviewDeadline !== null && (
            <Countdown deadline={chain.reviewDeadline} label="Sisa waktu persetujuan/review" />
          )}

          <section className="detail-section">
            <h2>Pihak dalam deal</h2>
            <div className="party-grid">
              <article>
                <small>SELLER</small>
                <Link href={`/profiles/${chain.seller}`} className="hover:text-[#116149] transition-colors">
                  <b className="underline decoration-dotted cursor-pointer">{short(chain.seller)}</b>
                </Link>
                <span>Pembuat deal</span>
              </article>
              <article>
                <small>BUYER</small>
                <Link href={`/profiles/${chain.buyer}`} className="hover:text-[#116149] transition-colors">
                  <b className="underline decoration-dotted cursor-pointer">{short(chain.buyer)}</b>
                </Link>
                <span>Pihak yang mendanai</span>
              </article>
              <article>
                <small>RESOLVER</small>
                <b>{short(chain.resolver)}</b>
                <span>Aktif hanya saat dispute</span>
              </article>
            </div>
          </section>

          {/* Private payloads display */}
          {payload.privateData && (
            <section className="detail-section">
              <h2>Dokumen Privat & Bukti Pengiriman</h2>
              {payload.privateData.deliveries.length === 0 &&
                payload.privateData.privateNotes.length === 0 && (
                  <p className="summary-note">Belum ada dokumen atau pengiriman privat.</p>
                )}

              {/* Private Deliveries */}
              {payload.privateData.deliveries.map((d: any) => (
                <div key={d.id} className="private-delivery-card">
                  <h3>Pengiriman Seller (Revisi #{d.revision})</h3>
                  <dl>
                    <dt>URL Hasil</dt>
                    <dd>
                      <a href={d.private_url} target="_blank" rel="noreferrer">
                        {d.private_url} <ExternalLink size={12} style={{ display: "inline" }} />
                      </a>
                    </dd>
                    <dt>Catatan</dt>
                    <dd>{d.private_note}</dd>
                    <dt>Pengirim</dt>
                    <dd><code>{short(d.submitter)}</code></dd>
                    <dt>Waktu</dt>
                    <dd>{new Date(d.created_at).toLocaleString("id-ID")}</dd>
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
                    Catatan {n.note_type === "dispute_reason" ? "Dispute" : `Permintaan Revisi #${n.revision_number}`}
                  </h3>
                  <dl>
                    <dt>Alasan</dt>
                    <dd>{n.reason}</dd>
                    {n.evidence_url && (
                      <>
                        <dt>URL Bukti</dt>
                        <dd>
                          <a href={n.evidence_url} target="_blank" rel="noreferrer">
                            {n.evidence_url} <ExternalLink size={12} style={{ display: "inline" }} />
                          </a>
                        </dd>
                      </>
                    )}
                    <dt>Oleh</dt>
                    <dd>
                      <code>{short(n.opener || n.buyer || "")}</code>
                    </dd>
                    <dt>Waktu</dt>
                    <dd>{new Date(n.created_at).toLocaleString("id-ID")}</dd>
                  </dl>
                </div>
              ))}
            </section>
          )}

          <section className="detail-section blockchain-box">
            <div>
              <ShieldCheck />
              <h2>Bukti blockchain</h2>
            </div>
            <dl>
              <dt>Terms hash</dt>
              <dd>
                {short(chain.termsHash)}{" "}
                <button
                  aria-label="Salin terms hash"
                  onClick={() => navigator.clipboard.writeText(chain.termsHash)}
                >
                  <Copy size={14} />
                </button>
              </dd>
              <dt>Contract deal ID</dt>
              <dd>{chain.id}</dd>
              <dt>Jaringan</dt>
              <dd>Stellar Testnet</dd>
            </dl>
            {payload.txHash ? (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${payload.txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                Lihat transaksi <ExternalLink size={14} />
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
          <p>Nilai deal</p>
          <strong>
            {(Number(chain.amountStroops) / 10_000_000).toLocaleString("id-ID", {
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
              {new Date(chain.deliveryDeadline * 1_000).toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </dd>
            <dt>Waktu review</dt>
            <dd>{chain.reviewPeriodSeconds / 3_600} jam</dd>
            <dt>Revisi</dt>
            <dd>
              {chain.revisionCount} / {chain.revisionLimit}
            </dd>
          </dl>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Halo, update status AmanPay Escrow Deal #${chain.id} (${metadata?.title ?? "Digital Deal"}): Status saat ini *${chain.status}*. Cek di: ${typeof window !== "undefined" ? window.location.href : ""}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-4 text-xs font-semibold rounded bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/30 cursor-pointer"
          >
            <Share2 size={13} /> Update via WhatsApp
          </a>

          <p className="summary-note">
            <ShieldCheck size={16} /> Dana tidak disimpan AmanPay.
          </p>
        </aside>
      </div>
    </>
  );
}
