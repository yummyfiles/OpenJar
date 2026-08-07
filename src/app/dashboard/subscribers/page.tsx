import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { SubscribersList } from "@/components/dashboard/subscribers-list";

export const dynamic = "force-dynamic";

export default async function DashboardSubscribersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/subscribers");
  return <SubscribersList />;
}
