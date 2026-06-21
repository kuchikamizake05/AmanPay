"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Wallet } from "lucide-react";
import { useWallet } from "@/features/wallet/wallet-provider";

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
  useEffect(() => {
    if (!wallet.address) return;
    fetch(`/api/deals?wallet=${wallet.address}`)
      .then((response) => response.json())
      .then((data) => {
        setDeals(data.deals ?? []);
        setConfigured(data.configured ?? true);
      });
  }, [wallet.address]);
  if (!wallet.address)
    return (
      <div className="empty-state">
        <Wallet size={30} />
        <h2>Hubungkan wallet untuk melihat deal</h2>
        <p>Dashboard mengikuti wallet, tanpa akun dan password tambahan.</p>
        <button className="button button--primary" onClick={wallet.connect}>
          Hubungkan wallet
        </button>
      </div>
    );
  return (
    <div>
      <div className="dashboard-head">
        <div>
          <p className="eyebrow">Ruang transaksi</p>
          <h1>Deal saya</h1>
          <p>
            {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
          </p>
        </div>
        <Link className="button button--primary" href="/deals/new">
          <Plus size={17} /> Buat deal
        </Link>
      </div>
      {!configured ? (
        <div className="notice">
          Supabase belum dikonfigurasi. Tambahkan environment untuk mengaktifkan
          indeks dashboard.
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
                    ? "Kamu seller"
                    : "Kamu buyer"}
                </span>
              </div>
              <strong>
                {(Number(deal.amount_stroops) / 10_000_000).toLocaleString(
                  "id-ID",
                )}
              </strong>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state empty-state--compact">
          <h2>Belum ada deal di wallet ini</h2>
          <p>Deal pertama selalu terasa paling resmi. Mari buat satu.</p>
          <Link href="/deals/new" className="text-link">
            Buat deal pertama <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
