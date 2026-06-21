import { CreateDealForm } from "@/features/deals/components/create-deal-form";

export default function NewDealPage() {
  return (
    <main className="shell app-page">
      <div className="page-heading">
        <p className="eyebrow">Deal baru</p>
        <h1>
          Susun kesepakatan
          <br />
          <em>yang sama-sama jelas.</em>
        </h1>
        <p>Buyer akan melihat terms yang sama sebelum mengunci dana.</p>
      </div>
      <CreateDealForm />
    </main>
  );
}
