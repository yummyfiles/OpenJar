import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError } from "@/lib/api";
import { adminStats, assertAdmin } from "@/server/services/admin";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const data = await adminStats();
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
