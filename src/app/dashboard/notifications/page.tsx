import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { NotificationsList } from "@/components/dashboard/notifications-list";

export const dynamic = "force-dynamic";

export default async function DashboardNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/notifications");
  return <NotificationsList />;
}
