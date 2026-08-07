import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { refreshCreatorGitHub } from "@/server/services/github";
import { ApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    if (!user.github) {
      throw new ApiError(400, "Connect a GitHub username in settings first");
    }
    const result = await refreshCreatorGitHub(user.id, user.github);
    return NextResponse.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}
