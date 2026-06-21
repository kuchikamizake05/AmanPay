import { DealDetail } from "@/features/deals/components/deal-detail";

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
