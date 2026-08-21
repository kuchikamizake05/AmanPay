"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Wallet, LoaderCircle, Share2, Check } from "lucide-react";
import { useWallet } from "@/features/wallet/wallet-provider";
import { NativePayment } from "./native-payment";

type Row = {
  contract_deal_id: string;
  title: string;
  deal_type: string;
  amount_stroops: string;
  seller_address: string;
  buyer_address: string;
  created_at: string;
};

export function Dashboard() {
  const wallet = useWallet();
  const [deals, setDeals] = useState<Row[]>([]);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleShareWallet = () => {
    if (!wallet.address) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const shareUrl = `${origin}/deals/new?buyer=${wallet.address}`;
    const shareMessage = `Hi, here is my verified AmanPay wallet link to initialize our escrow deal:\n${shareUrl}`;
    
    void navigator.clipboard.writeText(shareMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!wallet.address) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => setLoading(true));
    fetch(`/api/deals?wallet=${wallet.address}`)
      .then((response) => response.json())
      .then((data) => {
        setDeals(data.deals ?? []);
        setConfigured(data.configured ?? true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [wallet.address]);

  if (loading) {
    return (
      <div className="loading-state">
        <LoaderCircle className="spin text-[#116149]" /> Loading your escrow deals...
      </div>
    );
  }

  if (!wallet.address)
    return (
      <div className="empty-state">
        <Wallet size={30} />
        <h2>Connect Wallet to View Deals</h2>
        <p>Your dashboard is authenticated directly via your cryptographic Stellar wallet address.</p>
        <button className="button button--primary" onClick={wallet.connect}>
          Connect Wallet
        </button>
      </div>
    );

  const totalVolume = deals.reduce((acc, deal) => acc + (Number(deal.amount_stroops) / 10_000_000), 0);

  return (
    <div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Transaction Control Center</p>
          <h1>My Escrow Deals</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-neutral-500 font-mono">
              {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
            </span>
            <button
              onClick={handleShareWallet}
              className="text-[10px] bg-neutral-100 hover:bg-emerald-50 text-neutral-600 hover:text-emerald-700 border border-neutral-200 hover:border-emerald-200 px-2 py-0.5 rounded font-semibold cursor-pointer transition-all flex items-center gap-1 shrink-0"
              title="Copy buyer invite link"
            >
              {copied ? (
                <>
                  <Check size={10} className="text-emerald-600" />
                  <span>Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={10} />
                  <span>Share Address to Counterparty</span>
                </>
              )}
            </button>
          </div>
        </div>
        <Link className="button button--primary" href="/deals/new">
          <Plus size={17} /> Create New Deal
        </Link>
      </div>

      {/* Analytics Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="bg-white/60 border border-[#d8d2c3] p-4 rounded-xl shadow-2xs">
          <p className="text-xs text-[#667068] font-medium">Total Escrows</p>
          <p className="text-2xl font-black text-[#17231e] mt-1">{deals.length}</p>
        </div>
        <div className="bg-white/60 border border-[#d8d2c3] p-4 rounded-xl shadow-2xs">
          <p className="text-xs text-[#667068] font-medium">Total Volume Escrowed</p>
          <p className="text-2xl font-black text-[#116149] mt-1">
            {totalVolume.toLocaleString("en-US", { maximumFractionDigits: 2 })} <span className="text-xs font-semibold">USDC/XLM</span>
          </p>
        </div>
        <div className="bg-white/60 border border-[#d8d2c3] p-4 rounded-xl shadow-2xs">
          <p className="text-xs text-[#667068] font-medium">Native XLM Balance</p>
          <p className="text-2xl font-black text-[#e8a62e] mt-1">
            {wallet.balanceLoading ? "Loading…" : `${wallet.nativeBalance ?? "—"} XLM`}
          </p>
        </div>
      </div>

      <NativePayment />

      {!configured ? (
        <div className="notice">
          Supabase metadata storage not configured. On-chain contracts remain operational.
        </div>
      ) : null}
      {deals.length ? (
        <div className="deal-list">
          {deals.map((deal) => (
            <Link
              href={`/deals/${deal.contract_deal_id}`}
              className="deal-row"
              key={deal.contract_deal_id}
            >
              <div className="deal-row__id">
                #{deal.contract_deal_id.padStart(4, "0")}
              </div>
              <div>
                <b>{deal.title}</b>
                <span>
                  {deal.deal_type} ·{" "}
                  {deal.seller_address === wallet.address
                    ? "You are Seller"
                    : "You are Buyer"}
                </span>
              </div>
              <strong>
                {(Number(deal.amount_stroops) / 10_000_000).toLocaleString(
                  "en-US",
                )}
              </strong>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <h2>No deals found for this wallet</h2>
          <p>Create your first trustless escrow transaction backed by Soroban smart contracts.</p>
          <Link href="/deals/new" className="text-link">
            Create first deal <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
