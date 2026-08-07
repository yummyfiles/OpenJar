import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { toggleLike } from "@/server/services/posts";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const result = await toggleLike(user.id, id);
    return NextResponse.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}
