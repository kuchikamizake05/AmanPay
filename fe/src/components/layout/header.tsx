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
    <>
      <div className="bg-[#116149]/90 text-white text-[11px] py-1 px-4 text-center font-medium flex items-center justify-center gap-1.5 shadow-xs">
        <Sparkles size={13} className="text-[#e8a62e]" />
        <span>
          <strong>Demo Walkthrough:</strong> Gunakan panel <i>Simulator</i> di pojok kanan bawah untuk berganti peran Seller/Buyer secara instan.
        </span>
      </div>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="AmanPay beranda">
          <span className="brand__mark">
            <ShieldCheck size={19} />
          </span>
          AmanPay
        </Link>
        <nav aria-label="Navigasi utama">
          <Link href="/dashboard">Deal saya</Link>
          <Link href="/deals/new">Buat deal</Link>
        </nav>
        {wallet.address ? (
          <div className="flex items-center gap-2">
            {wallet.isSimulator && (
              <span className="bg-[#e8a62e]/10 border border-[#e8a62e]/30 text-[#e8a62e] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Simulator
              </span>
            )}
            <button
              className="wallet-pill cursor-pointer flex items-center hover:bg-white/80 active:scale-95 transition-all"
              onClick={handleCopy}
              title="Salin alamat wallet"
            >
              <span 
                className="wallet-pill__signal" 
                style={{ backgroundColor: wallet.isSimulator ? "var(--amber)" : "#2aa779" }} 
              />
              <span>
                {copied ? "Tersalin!" : short(wallet.address)}
              </span>
            </button>
            <button
              className="p-2 border border-neutral-200 hover:border-red-200 hover:bg-red-50 text-neutral-500 hover:text-red-600 rounded-full transition-all cursor-pointer flex items-center justify-center"
              onClick={wallet.disconnect}
              title="Putuskan koneksi wallet"
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
            {wallet.connecting ? "Membuka…" : "Hubungkan wallet"}
          </button>
        )}
      </header>
    </>
  );
}
