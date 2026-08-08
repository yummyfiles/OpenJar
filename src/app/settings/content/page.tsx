import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import ContentManager from "@/components/settings/content-manager";

export const dynamic = "force-dynamic";

export default async function SettingsContentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings/content");
  return <ContentManager />;
}
