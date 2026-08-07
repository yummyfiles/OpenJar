import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { assertAdmin, listUsers } from "@/server/services/admin";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const url = new URL(req.url);
    const data = await listUsers({
      q: url.searchParams.get("q") ?? undefined,
      role: url.searchParams.get("role") ?? undefined,
      page: Number(url.searchParams.get("page") ?? 1),
      perPage: Number(url.searchParams.get("perPage") ?? 25)
    });
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
