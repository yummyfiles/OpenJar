import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { isValidUsername, slugify } from "@/lib/utils";
import { RESERVED_USERNAMES, CREATOR_CATEGORIES } from "@/lib/constants";
import { profileUpdateSchema, onboardingSchema } from "@/lib/validations";

// updates a user's public profile. also used to complete onboarding.
export async function updateProfile(userId: string, rawInput: unknown, opts: { completeOnboarding?: boolean } = {}) {
  const parsed = (opts.completeOnboarding ? onboardingSchema : profileUpdateSchema).safeParse(rawInput);
  if (!parsed.success) {
    throw new ApiError(400, "Invalid profile data", "validation_error");
  }
  const input = parsed.data;

  const data: Record<string, unknown> = {};

  if (input.username !== undefined) {
    const username = input.username.trim().toLowerCase();
    if (!isValidUsername(username)) {
      throw new ApiError(400, "Username must be 3-32 characters: lowercase letters, numbers, underscores");
    }
    if (RESERVED_USERNAMES.includes(username)) {
      throw new ApiError(400, "That username is reserved");
    }
    const taken = await prisma.user.findFirst({ where: { username, NOT: { id: userId } } });
    if (taken) throw new ApiError(409, "That username is already taken");
    data.username = username;
  }

  const stringFields = ["displayName", "bio", "website", "github", "twitter", "location", "category", "currency"] as const;
  for (const field of stringFields) {
    const value = input[field as keyof typeof input];
    if (value !== undefined) {
      data[field] = (value as string).trim() || null;
    }
  }

  if (input.category && !CREATOR_CATEGORIES.some((c) => c.id === input.category)) {
    throw new ApiError(400, "Unknown category");
  }

  if (input.accent !== undefined && input.accent) {
    data.accent = input.accent.startsWith("#") ? input.accent : `#${input.accent}`;
  }

  if (input.isCreator !== undefined) data.isCreator = input.isCreator;
  if (opts.completeOnboarding) data.onboardingDone = true;

  return prisma.user.update({ where: { id: userId }, data: data as never });
}

export function getProfilePagePath(username: string) {
  return `/${username}`;
}

export function defaultSlug(input: string) {
  return slugify(input);
}
