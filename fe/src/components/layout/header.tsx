"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useWallet } from "@/features/wallet/wallet-provider";

const short = (value: string) => `${value.slice(0, 5)}…${value.slice(-4)}`;

export function Header() {
  const pathname = usePathname();
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const isLanding = pathname === "/";

  const handleCopy = () => {
    if (!wallet.address) return;
    void navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2_000);
  };

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="AmanPay Home">
        <span className="brand__mark">
          <ShieldCheck size={19} />
        </span>
        AmanPay
      </Link>

      {isLanding ? (
        <nav aria-label="Landing navigation" className="flex items-center gap-6 ml-auto">
          <a href="#how-it-works" className="text-sm font-semibold hover:text-[#116149] transition-colors">
            How It Works
          </a>
          <a href="#use-cases" className="text-sm font-semibold hover:text-[#116149] transition-colors">
            Use Cases
          </a>
          <Link href="/proof" className="text-sm font-semibold hover:text-[#116149] transition-colors">
            Proof
          </Link>
          <Link
            href="/dashboard"
            className="button button--primary button--small font-bold flex items-center gap-1.5 shadow-sm"
          >
            <span>Launch App</span>
            <ArrowRight size={14} />
          </Link>
        </nav>
      ) : (
        <>
          <nav aria-label="App navigation" className="flex items-center gap-4 ml-auto">
            <Link
              href="/dashboard"
              className={`text-sm font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                pathname === "/dashboard"
                  ? "bg-[#116149]/10 text-[#116149] font-bold"
                  : "text-[#667068] hover:text-[#17231e]"
              }`}
            >
              <LayoutDashboard size={15} />
              <span>My Deals</span>
            </Link>
            <Link
              href="/deals/new"
              className={`text-sm font-semibold flex items-center gap-1.5 py-1.5 px-3 rounded-lg transition-all ${
                pathname === "/deals/new"
                  ? "bg-[#116149]/10 text-[#116149] font-bold"
                  : "text-[#667068] hover:text-[#17231e]"
              }`}
            >
              <PlusCircle size={15} />
              <span>Create Deal</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2 ml-3">
            {wallet.address ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#116149] whitespace-nowrap" title="Native XLM balance">
                  XLM {wallet.balanceLoading ? "…" : wallet.nativeBalance ?? "—"}
                </span>
                <button
                  className="wallet-pill cursor-pointer flex items-center hover:bg-white/80 active:scale-95 transition-all shadow-xs"
                  onClick={handleCopy}
                  title="Copy wallet address"
                >
                  <span className="wallet-pill__signal" style={{ backgroundColor: "#2aa779" }} />
                  <span className="text-xs font-mono">{copied ? "Copied!" : short(wallet.address)}</span>
                </button>
                <button
                  className="p-2 border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-xs"
                  onClick={wallet.disconnect}
                  title="Disconnect wallet"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                className="button button--dark button--small text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                onClick={wallet.connect}
                disabled={wallet.connecting}
              >
                <Wallet size={14} />
                <span>{wallet.connecting ? "Connecting…" : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </>
      )}
    </header>
  );
}
