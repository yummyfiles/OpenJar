import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ data: null });

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      website: true,
      github: true,
      twitter: true,
      youtube: true,
      twitch: true,
      location: true,
      customLinks: true,
      isCreator: true,
      onboardingDone: true,
      verified: true,
      role: true,
      currency: true,
      monthlyGoal: true,
      allowAnonymous: true,
      allowMessages: true,
      minDonation: true,
      themeMode: true,
      accent: true,
      monoBranding: true,
      createdAt: true
    }
  });

  return NextResponse.json({ data: profile });
}
