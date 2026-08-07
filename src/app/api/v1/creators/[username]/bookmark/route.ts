import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { toggleBookmark } from "@/server/services/social";

export async function POST(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { username } = await params;
    const result = await toggleBookmark(user.id, username);
    return NextResponse.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}
