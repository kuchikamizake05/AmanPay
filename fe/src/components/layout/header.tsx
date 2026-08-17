"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Wallet, LogOut, Sparkles } from "lucide-react";
import { useWallet } from "@/features/wallet/wallet-provider";

const short = (value: string) => `${value.slice(0, 5)}…${value.slice(-4)}`;

export function Header() {
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!wallet.address) return;
    void navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="AmanPay Home">
        <span className="brand__mark">
          <ShieldCheck size={19} />
        </span>
        AmanPay
      </Link>
      <nav aria-label="Main navigation">
        <Link href="/dashboard">My Deals</Link>
        <Link href="/deals/new">Create Deal</Link>
      </nav>
      {wallet.address ? (
        <div className="flex items-center gap-2">
          <button
            className="wallet-pill cursor-pointer flex items-center hover:bg-white/80 active:scale-95 transition-all"
            onClick={handleCopy}
            title="Copy wallet address"
          >
            <span 
              className="wallet-pill__signal" 
              style={{ backgroundColor: "#2aa779" }} 
            />
            <span>
              {copied ? "Copied!" : short(wallet.address)}
            </span>
          </button>
          <button
            className="p-2 border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-full transition-all cursor-pointer flex items-center justify-center"
            onClick={wallet.disconnect}
            title="Disconnect wallet"
          >
            <LogOut size={13} />
          </button>
        </div>
      ) : (
        <button
          className="button button--dark button--small"
          onClick={wallet.connect}
          disabled={wallet.connecting}
        >
          <Wallet size={16} />{" "}
          {wallet.connecting ? "Opening…" : "Connect Wallet"}
        </button>
      )}
    </header>
  );
}
