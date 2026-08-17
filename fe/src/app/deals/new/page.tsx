import { CreateDealForm } from "@/features/deals/components/create-deal-form";

export default function NewDealPage() {
  return (
    <main className="shell app-page">
      <div className="page-heading">
        <p className="eyebrow">New Escrow Deal</p>
        <h1>
          Draft transparent terms
          <br />
          <em>enforced by smart contract.</em>
        </h1>
        <p>Both buyer and seller verify identical cryptographic terms before funds are locked.</p>
      </div>
      <CreateDealForm />
    </main>
  );
}
