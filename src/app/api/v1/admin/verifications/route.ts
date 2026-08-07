import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { assertAdmin, listVerificationRequests } from "@/server/services/admin";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const data = await listVerificationRequests();
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
