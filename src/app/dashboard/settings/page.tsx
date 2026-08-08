import { redirect } from "next/navigation";
import { getCurrentUserFull } from "@/lib/session";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const user = await getCurrentUserFull();
  if (!user) redirect("/login?next=/dashboard/settings");

  return (
    <SettingsForm
      initial={{
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        website: user.website,
        github: user.github,
        twitter: user.twitter,
        location: user.location,
        category: user.category,
        currency: user.currency,
        accent: user.accent
      }}
    />
  );
}
