import { Metadata } from "next";
import { DealDetail } from "@/features/deals/components/deal-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `AmanPay Deal #${id} — Verified Escrow`,
    description: `Track and verify Soroban smart contract escrow terms for Deal #${id} on Stellar Testnet.`,
    openGraph: {
      title: `AmanPay Deal #${id} — Escrow Terverifikasi`,
      description: `Transaksi rekber smart contract aman tanpa perantara manusia di Stellar Soroban.`,
      type: "website",
    },
  };
}

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="shell app-page">
      <DealDetail id={id} />
    </main>
  );
}
