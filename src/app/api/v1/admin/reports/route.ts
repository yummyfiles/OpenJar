import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { assertAdmin, listReports } from "@/server/services/admin";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const url = new URL(req.url);
    const data = await listReports(url.searchParams.get("status") ?? undefined);
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
