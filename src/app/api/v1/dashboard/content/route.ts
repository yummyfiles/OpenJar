import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { getOwnedContent } from "@/server/services/content";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const data = await getOwnedContent(user.id);
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
