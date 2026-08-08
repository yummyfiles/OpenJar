import { redirect } from "next/navigation";
import { getCurrentUserFull } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SupporterProfile } from "@/components/account/supporter-profile";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const user = await getCurrentUserFull();
  if (!user) redirect("/login?next=/me");

  // creators already have a public page — send them there
  if (user.isCreator || user.username) {
    redirect(user.username ? `/${user.username}` : "/settings");
  }

  // supporters skip onboarding entirely — mark it done so login/signup
  // redirects don't bounce them to the creator onboarding flow
  if (!user.onboardingDone) {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingDone: true }
    });
  }

  return <SupporterProfile user={user} />;
}
