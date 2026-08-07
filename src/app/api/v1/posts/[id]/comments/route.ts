import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { commentSchema } from "@/lib/validations";
import { addComment, listComments } from "@/server/services/posts";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const comments = await listComments(id);
    return NextResponse.json({ data: comments });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const rl = rateLimit(clientIp(req), { key: "comments", limit: 20 });
    if (!rl.success) {
      return NextResponse.json({ error: { code: "rate_limited", message: "Slow down" } }, { status: 429 });
    }

    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const input = commentSchema.parse(await readJson(req));
    const comment = await addComment(user.id, id, input.content, input.parentId ?? null);
    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
