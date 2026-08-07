import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { updateProfile } from "@/server/services/profile";
import { getProfilePagePath } from "@/server/services/profile";

export async function PATCH(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const body = await readJson(req);
    const isOnboarding = typeof body === "object" && body !== null && "completeOnboarding" in body;
    const { completeOnboarding, ...profile } = (body ?? {}) as Record<string, unknown>;

    const updated = await updateProfile(user.id, profile, { completeOnboarding: Boolean(completeOnboarding) });
    return NextResponse.json({
      data: {
        profile: updated,
        redirect: updated.onboardingDone && updated.username ? getProfilePagePath(updated.username) : null
      }
    });
  } catch (err) {
    return handleError(err);
  }
}
