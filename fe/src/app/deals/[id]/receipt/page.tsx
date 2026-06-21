import { PublicReceipt } from "@/features/deals/components/public-receipt";

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
