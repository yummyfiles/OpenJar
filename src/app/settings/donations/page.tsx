import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import DonationsManager from "@/components/settings/donations-manager";

export const dynamic = "force-dynamic";

export default async function SettingsDonationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings/donations");
  return <DonationsManager />;
}
