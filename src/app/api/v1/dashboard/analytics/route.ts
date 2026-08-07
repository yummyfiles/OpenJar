import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { getAnalytics } from "@/server/services/analytics";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const url = new URL(req.url);
    const days = Math.min(Number(url.searchParams.get("days") ?? 30), 90);
    const data = await getAnalytics(user.id, days);
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
