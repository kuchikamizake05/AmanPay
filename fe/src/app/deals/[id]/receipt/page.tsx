import { Metadata } from "next";
import { PublicReceipt } from "@/features/deals/components/public-receipt";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Official Settlement Receipt #${id} — AmanPay`,
    description: `Verifiable on-chain settlement receipt backed by Stellar Soroban smart contract.`,
    openGraph: {
      title: `Official Settlement Receipt #${id} — AmanPay`,
      description: `Verifiable on-chain settlement receipt backed by Stellar Soroban smart contract.`,
      type: "website",
    },
  };
}

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="shell app-page">
      <PublicReceipt id={id} />
    </main>
  );
}
