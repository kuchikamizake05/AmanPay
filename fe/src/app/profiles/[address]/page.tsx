import { ProfileView } from "@/features/deals/components/profile-view";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ address: string }>;
}) {
  const { address } = await params;
  return (
    <main className="shell app-page">
      <ProfileView address={address} />
    </main>
  );
}
