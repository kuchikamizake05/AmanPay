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
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { stellarConfig } from "@/config/stellar";

type ProfileStats = {
  completedCount: number;
  disputedCount: number;
  totalVolume: string;
};

type ProfileDeal = {
  contract_deal_id: string;
  title: string;
  deal_type: "Service" | "DigitalGoods" | "Custom";
  amount_stroops: string;
  seller_address: string;
  buyer_address: string;
  asset_address: string;
  created_at: string;
  status: string;
};

type ProfileData = {
  wallet: string;
  stats: ProfileStats;
  completedDeals: ProfileDeal[];
};

const short = (value: string) => `${value.slice(0, 8)}…${value.slice(-6)}`;

export function ProfileView({ address }: { address: string }) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/profiles/${address}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Gagal memuat profil");
        return json;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [address]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="empty-state">
        <ShieldAlert size={48} className="text-[#a43b31]" />
        <h2>Unable to Load Profile</h2>
        <p>{error}</p>
        <Link href="/" className="button button--primary button--small mt-4">
          Return to Home
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-state">
        <LoaderCircle className="spin text-[#116149]" /> Loading verified on-chain track record...
      </div>
    );
  }

  const { stats, completedDeals } = data;
  const volume = Number(stats.totalVolume) / 10_000_000;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-white/40 backdrop-blur-md border border-[#d8d2c3] rounded-xl p-8 shadow-sm mb-8 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className="w-16 h-16 rounded-full bg-[#116149] text-white flex items-center justify-center font-bold text-2xl shadow-inner border-2 border-[#d8d2c3]">
              {address.slice(1, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <h1 className="font-extrabold text-2xl text-[#17231e]">
                  Wallet Track Record
                </h1>
                <span className="bg-[#116149]/10 text-[#116149] text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Verified
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-sm text-[#667068]">
                <code className="font-mono bg-white/60 px-2 py-1 border border-[#d8d2c3] rounded text-xs">
                  {short(address)}
                </code>
                <button
                  onClick={copyAddress}
                  className="p-1 hover:bg-[#dceadf] hover:text-[#116149] rounded transition-colors cursor-pointer"
                  title="Copy Wallet Address"
                >
                  {copied ? (
                    <span className="text-[10px] font-bold text-[#116149]">Copied!</span>
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-[#d8d2c3]">
          {/* Completed Stats */}
          <div className="bg-white/50 border border-[#d8d2c3]/60 p-5 rounded-lg">
            <span className="text-xs font-bold text-[#667068] uppercase tracking-wider block mb-2">
              Settled Deals
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-3xl font-extrabold text-[#116149] leading-none">
                {stats.completedCount}
              </strong>
              <span className="text-xs text-[#667068] font-semibold">deals</span>
            </div>
            <p className="text-xs text-[#667068] mt-2">
              Successfully completed and released escrow transactions.
            </p>
          </div>

          {/* Volume Stats */}
          <div className="bg-white/50 border border-[#d8d2c3]/60 p-5 rounded-lg">
            <span className="text-xs font-bold text-[#667068] uppercase tracking-wider block mb-2">
              Settled Volume
            </span>
            <div className="flex items-baseline gap-1.5">
              <strong className="text-3xl font-extrabold text-[#17231e] leading-none">
                {volume.toLocaleString("en-US", { maximumFractionDigits: 4 })}
              </strong>
              <span className="text-xs font-bold text-[#116149]">USDC/XLM</span>
            </div>
            <p className="text-xs text-[#667068] mt-2">
              Total volume settled safely via Soroban smart contracts.
            </p>
          </div>

          {/* Dispute Stats */}
          <div className="bg-white/50 border border-[#d8d2c3]/60 p-5 rounded-lg">
            <span className="text-xs font-bold text-[#667068] uppercase tracking-wider block mb-2">
              Disputed Escrows
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-3xl font-extrabold text-[#a43b31] leading-none">
                {stats.disputedCount}
              </strong>
              <span className="text-xs text-[#667068] font-semibold">times</span>
            </div>
            <p className="text-xs text-[#667068] mt-2">
              Number of escrow disputes opened across history.
            </p>
          </div>
        </div>
      </div>

      {/* Completed Deals List */}
      <div>
        <h2 className="font-extrabold text-xl text-[#17231e] mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#116149]" size={20} /> Settled Escrow History
        </h2>

        {completedDeals.length === 0 ? (
          <div className="bg-white/30 border border-[#d8d2c3] border-dashed rounded-xl p-12 text-center">
            <CheckCircle2 size={36} className="text-[#667068]/50 mx-auto mb-3" />
            <h3 className="font-bold text-[#17231e]">No Settled Deals Found</h3>
            <p className="text-sm text-[#667068] mt-1 max-w-md mx-auto">
              This wallet has not completed and released any escrow deals on the testnet yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {completedDeals.map((deal) => {
              const dealAmount = Number(deal.amount_stroops) / 10_000_000;
              const isSeller = deal.seller_address === address;
              const counterparty = isSeller ? deal.buyer_address : deal.seller_address;
              const assetCode =
                stellarConfig.assets.find((a) => a.contractId === deal.asset_address)?.code ?? "USDC";

              return (
                <div
                  key={deal.contract_deal_id}
                  className="bg-white/60 border border-[#d8d2c3] hover:border-[#116149]/40 p-5 rounded-xl shadow-xs transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono font-bold text-[#116149] bg-[#116149]/10 px-2 py-0.5 rounded">
                        #{deal.contract_deal_id.padStart(4, "0")}
                      </span>
                      <span className="text-xs font-semibold text-[#667068] bg-neutral-100 px-2 py-0.5 rounded">
                        {deal.deal_type}
                      </span>
                      <span className="text-[11px] text-[#667068]">
                        {new Date(deal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#17231e]">{deal.title}</h3>
                    <p className="text-xs text-[#667068] mt-1">
                      Counterparty:{" "}
                      <Link
                        href={`/profiles/${counterparty}`}
                        className="font-mono text-[#116149] hover:underline"
                      >
                        {short(counterparty)}
                      </Link>{" "}
                      ({isSeller ? "Buyer" : "Seller"})
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100">
                    <div className="text-left md:text-right">
                      <strong className="text-lg font-bold text-[#17231e] block leading-tight">
                        {dealAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {assetCode}
                      </strong>
                      <span className="text-[11px] font-medium text-emerald-600">Settled & Verified</span>
                    </div>
                    <Link
                      href={`/deals/${deal.contract_deal_id}/receipt`}
                      className="button button--dark button--small text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
                    >
                      <span>Receipt</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
