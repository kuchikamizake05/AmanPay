"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import type { ChainDeal } from "@/lib/stellar/contract";
import { stellarConfig } from "@/config/stellar";
import type { CanonicalDealTerms } from "../model/metadata";
import { DealStatusBadge } from "./deal-status";

type Payload = {
  chain: ChainDeal;
  metadata: CanonicalDealTerms | null;
  txHash: string | null;
  termsHashVerified: boolean;
};
const short = (value: string) => `${value.slice(0, 7)}…${value.slice(-5)}`;

export function DealDetail({ id }: { id: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/api/deals/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data;
      })
      .then(setPayload)
      .catch((cause) => setError(cause.message));
  }, [id]);
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
        <section className="detail-section">
          <h2>Pihak dalam deal</h2>
          <div className="party-grid">
            <article>
              <small>SELLER</small>
              <b>{short(chain.seller)}</b>
              <span>Pembuat deal</span>
            </article>
            <article>
              <small>BUYER</small>
              <b>{short(chain.buyer)}</b>
              <span>Pihak yang mendanai</span>
            </article>
            <article>
              <small>RESOLVER</small>
              <b>{short(chain.resolver)}</b>
              <span>Aktif hanya saat dispute</span>
            </article>
          </div>
        </section>
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
          )?.code ?? "ASSET"}
        </span>
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
        <p className="summary-note">
          <ShieldCheck size={16} /> Dana tidak disimpan AmanPay.
        </p>
      </aside>
    </div>
  );
}
