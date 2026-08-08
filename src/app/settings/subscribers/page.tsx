import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { SubscribersList } from "@/components/settings/subscribers-list";

export const dynamic = "force-dynamic";

export default async function SettingsSubscribersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings/subscribers");
  return <SubscribersList />;
}
