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
  Send,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { stellarConfig } from "@/config/stellar";
import type { ChainDeal } from "@/lib/stellar/codec";
import type { CanonicalDealTerms } from "../model/metadata";

type Payload = {
  chain: ChainDeal;
  metadata: CanonicalDealTerms | null;
  txHash: string | null;
  termsHashVerified: boolean;
  timeline: any[];
  sessionWallet: string | null;
};

const short = (value: string) => `${value.slice(0, 10)}…${value.slice(-8)}`;

export function formatShareMessage(
  title: string,
  amount: string,
  assetCode: string,
  id: string,
  status: string,
  origin: string
): string {
  const statusEmoji = status === "Released" ? "✅" : "↩️";
  const statusText = status === "Released" ? "RELEASED (Funds Settled)" : "REFUNDED (Funds Returned)";
  return `⚡ AmanPay Escrow Receipt: Deal #${id.padStart(4, "0")} successfully settled!

Title: ${title}
Amount: ${amount} ${assetCode}
Status: ${statusEmoji} ${statusText}

Verify on-chain settlement receipt:
${origin}/deals/${id}/receipt`;
}

export function PublicReceipt({ id }: { id: string }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

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

  if (error) {
    return (
      <div className="empty-state">
        <ShieldAlert size={48} className="text-[#a43b31]" />
        <h2>Receipt Not Found</h2>
        <p>{error}</p>
        <Link href="/" className="button button--primary button--small mt-4">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="loading-state">
        <LoaderCircle className="spin text-[#116149]" /> Reading settlement receipt from blockchain...
      </div>
    );
  }

  const { chain, metadata, txHash } = payload;
  const isReleased = chain.status === "Released";
  const isRefunded = chain.status === "Refunded";

  // Check if deal is completed (either Released or Refunded)
  if (!isReleased && !isRefunded) {
    return (
      <div className="empty-state">
        <ShieldAlert size={48} className="text-[#e8a62e]" />
        <h2>Receipt Not Yet Published</h2>
        <p>Public receipts are issued only after an escrow is finalized (Released or Refunded).</p>
        <Link href={`/deals/${id}`} className="button button--primary button--small mt-4">
          Open Deal Details
        </Link>
      </div>
    );
  }

  const amount = (Number(chain.amountStroops) / 10_000_000).toLocaleString("en-US", {
    maximumFractionDigits: 7,
  });
  const assetCode =
    stellarConfig.assets.find((asset) => asset.contractId === chain.asset)?.code ?? "USDC";

  // Timeline events for completed date
  const completeEvent = payload.timeline.find(
    (ev) => ev.resulting_status === "Released" || ev.resulting_status === "Refunded"
  );
  const completedDate = completeEvent
    ? new Date(completeEvent.created_at).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
  const assetCode =
    stellarConfig.assets.find((asset) => asset.contractId === chain.asset)?.code ?? "ASSET";

  // Timeline events for completed date
  const completeEvent = payload.timeline.find(
    (ev) => ev.resulting_status === "Released" || ev.resulting_status === "Refunded"
  );
  const completedDate = completeEvent
    ? new Date(completeEvent.created_at).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareText = formatShareMessage(
    metadata?.title ?? "Transaksi",
    amount,
    assetCode,
    chain.id,
    chain.status,
    origin
  );

  const copyReceiptLink = () => {
    navigator.clipboard.writeText(`${origin}/deals/${id}/receipt`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyReceiptText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    `${origin}/deals/${id}/receipt`
  )}&text=${encodeURIComponent(shareText)}`;

  const sealText = isReleased ? "VERIFIED\nRELEASE" : "VERIFIED\nREFUND";
  const sealColor = isReleased ? "rgba(17, 97, 73, 0.65)" : "rgba(164, 59, 49, 0.65)";

  return (
    <div className="max-w-xl mx-auto">
      <Link
        href={`/deals/${id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#667068] hover:text-[#17231e] mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Return to deal details
      </Link>

      {/* Serrated Physical Receipt Card */}
      <div className="receipt-card mb-8">
        <div className="receipt-card__top">
          <span>AMANPAY SETTLEMENT TRANSCRIPT</span>
          <span>{chain.status.toUpperCase()}</span>
        </div>

        <div className="my-6 text-center">
          <span className="text-xs uppercase tracking-widest text-[#667068] block mb-1">
            Total Settled Amount
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <strong className="font-serif text-4xl font-extrabold text-[#17231e]">
              {amount}
            </strong>
            <span className="text-sm font-bold text-[#116149]">{assetCode}</span>
          </div>
        </div>

        {/* Receipt Properties */}
        <div className="border-t border-dashed border-[#d8d2c3] pt-5 pb-4 text-xs font-mono text-[#17231e]">
          <dl className="grid grid-cols-[140px_1fr] gap-y-3 leading-relaxed">
            <dt className="text-[#667068]">Transaction ID:</dt>
            <dd className="font-bold">DEAL #{chain.id.padStart(4, "0")}</dd>

            <dt className="text-[#667068]">Deal Title:</dt>
            <dd className="font-sans font-bold text-sm text-[#17231e]">
              {metadata?.title ?? `${chain.dealType} Deal`}
            </dd>

            <dt className="text-[#667068]">Deal Type:</dt>
            <dd>{chain.dealType}</dd>

            <dt className="text-[#667068]">Escrow Status:</dt>
            <dd className="font-bold uppercase tracking-wider text-[#116149]">
              {chain.status === "Released" ? "Released (Settled)" : "Refunded (Returned)"}
            </dd>

            <dt className="text-[#667068]">Settled At:</dt>
            <dd>{completedDate}</dd>

            <div className="col-span-2 border-t border-dotted border-[#d8d2c3] my-2" />

            <dt className="text-[#667068]">Seller Address:</dt>
            <dd className="break-all">
              <Link href={`/profiles/${chain.seller}`} className="underline hover:text-[#116149]">
                {short(chain.seller)}
              </Link>
            </dd>

            <dt className="text-[#667068]">Buyer Address:</dt>
            <dd className="break-all">
              <Link href={`/profiles/${chain.buyer}`} className="underline hover:text-[#116149]">
                {short(chain.buyer)}
              </Link>
            </dd>

            <dt className="text-[#667068]">Alamat Resolver:</dt>
            <dd className="break-all">{short(chain.resolver)}</dd>

            <div className="col-span-2 border-t border-dotted border-[#d8d2c3] my-2" />

            <dt className="text-[#667068]">Terms Hash:</dt>
            <dd className="break-all font-mono text-[10px]">{chain.termsHash}</dd>

            {txHash && (
              <>
                <dt className="text-[#667068]">Blockchain Tx:</dt>
                <dd className="flex items-center gap-1">
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-[#116149] hover:text-[#116149]/80 flex items-center gap-0.5"
                  >
                    Stellar Expert <ExternalLink size={10} />
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>

        {/* Dynamic Stamp Seal */}
        <div
          className="receipt-card__seal"
          style={{ color: sealColor, borderColor: sealColor }}
        >
          {sealText}
        </div>
      </div>

      {/* Share / Copy Options Panel */}
      <div className="bg-white/40 backdrop-blur-md border border-[#d8d2c3] rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-sm text-[#17231e] mb-4 flex items-center gap-2">
          <Share2 size={16} className="text-[#116149]" /> Share Settlement Receipt
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={copyReceiptLink}
            className="button button--paper border border-[#d8d2c3] py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-semibold select-none hover:bg-white"
          >
            {copiedLink ? "Link Copied!" : "Copy Receipt Link"}
          </button>
          <button
            onClick={copyReceiptText}
            className="button button--paper border border-[#d8d2c3] py-2 px-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-semibold select-none hover:bg-white"
          >
            {copiedText ? "Text Copied!" : "Copy Summary Text"}
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="button button--primary button--small text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer font-semibold w-full"
          >
            <Send size={14} /> Send via WhatsApp
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="button button--dark button--small text-xs py-2.5 flex items-center justify-center gap-2 cursor-pointer font-semibold w-full"
          >
            <Send size={14} /> Send via Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
