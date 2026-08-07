import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { getDashboardOverview } from "@/server/services/analytics";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const data = await getDashboardOverview(user.id);
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
