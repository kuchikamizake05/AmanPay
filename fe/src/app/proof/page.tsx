import Link from "next/link";
import {
  ArrowRight,
  FileCheck2,
  LockKeyhole,
  ReceiptText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

export const metadata = {
  title: "Product Proof | AmanPay",
  description: "How to verify AmanPay escrow evidence on Stellar Testnet.",
};

const proofItems = [
  {
    icon: FileCheck2,
    title: "Terms hash",
    copy: "Each deal records a hash of its agreed terms. Compare it with original deal data before funding.",
  },
  {
    icon: LockKeyhole,
    title: "Non-custodial escrow",
    copy: "Funds follow Soroban smart-contract rules. AmanPay does not hold a private key for escrow funds.",
  },
  {
    icon: ReceiptText,
    title: "Settlement receipt",
    copy: "Completed released or refunded deals publish a receipt with deal state, terms hash, and Testnet transaction link.",
  },
  {
    icon: UserRoundCheck,
    title: "Wallet track record",
    copy: "Public wallet profiles show completed deal history and dispute count from recorded Testnet escrow data.",
  },
];

export default function ProductProofPage() {
  return (
    <main className="shell app-page">
      <section className="page-heading">
        <p className="eyebrow">Product Proof</p>
        <h1>
          Trust claims need
          <br />
          <em>evidence.</em>
        </h1>
        <p>
          AmanPay uses Stellar Testnet. This page explains what every buyer or seller can verify before trusting a deal.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4" aria-label="Verifiable escrow evidence">
        {proofItems.map(({ icon: Icon, title, copy }) => (
          <article className="bg-white/50 border border-[#d8d2c3] p-6 rounded-xl" key={title}>
            <Icon className="text-[#116149] mb-5" size={25} />
            <h2 className="font-bold text-xl text-[#17231e] mb-2">{title}</h2>
            <p className="text-sm leading-relaxed text-[#667068]">{copy}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 border border-dashed border-[#d8d2c3] bg-white/30 p-8 rounded-xl">
        <div className="flex items-start gap-3">
          <ShieldCheck className="shrink-0 text-[#116149] mt-0.5" size={24} />
          <div>
            <p className="eyebrow">Real evidence only</p>
            <h2 className="font-bold text-2xl text-[#17231e] mb-2">No placeholder testimonials.</h2>
            <p className="text-sm leading-relaxed text-[#667068] max-w-2xl">
              Receipt links and wallet profiles appear after genuine Testnet settlements. AmanPay does not publish invented reviews, transaction IDs, wallet activity, or success metrics.
            </p>
          </div>
        </div>
      </section>

      <section className="cta-band mt-12">
        <div>
          <p className="eyebrow">Verify your own flow</p>
          <h2>Build deal proof<br />from first transaction.</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className="button button--paper" href="/deals/new">
            Create Testnet Deal <ArrowRight size={18} />
          </Link>
          <Link className="button border border-white/40 text-white" href="/dashboard">
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
