import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NotificationsList } from "@/components/settings/notifications-list";

export const dynamic = "force-dynamic";

export default async function SettingsNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings/notifications");
  return <NotificationsList />;
}
