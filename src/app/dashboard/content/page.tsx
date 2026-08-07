import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ContentManager from "@/components/dashboard/content-manager";

export const dynamic = "force-dynamic";

export default async function DashboardContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/content");
  return <ContentManager />;
}
