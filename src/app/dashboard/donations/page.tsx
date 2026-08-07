import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import DonationsManager from "@/components/dashboard/donations-manager";

export const dynamic = "force-dynamic";

export default async function DashboardDonationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/donations");
  return <DonationsManager />;
}
