"use client";

import Link from "next/link";
import { ShieldCheck, Wallet } from "lucide-react";
import { useWallet } from "@/features/wallet/wallet-provider";

const short = (value: string) => `${value.slice(0, 5)}…${value.slice(-4)}`;

export function Header() {
  const wallet = useWallet();
  return (
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
        <button
          className="wallet-pill"
          onClick={wallet.disconnect}
          title="Putuskan wallet"
        >
          <span className="wallet-pill__signal" />
          {short(wallet.address)}
        </button>
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
  );
}
