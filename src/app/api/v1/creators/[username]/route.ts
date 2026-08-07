import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import { getCreatorPageData } from "@/server/services/creators";

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const data = await getCreatorPageData(username);
    if (!data) return NextResponse.json({ error: { code: "not_found", message: "Creator not found" } }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}
