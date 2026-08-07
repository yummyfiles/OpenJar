import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { postSchema } from "@/lib/validations";
import { createPost } from "@/server/services/posts";

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const body = await readJson(req);
    const input = postSchema.parse(body);
    const post = await createPost(user.id, {
      title: input.title ?? undefined,
      content: input.content,
      excerpt: input.excerpt ?? undefined,
      coverImage: input.coverImage ?? undefined,
      status: input.status,
      pinned: input.pinned,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      poll: input.poll ?? null,
      kind: typeof body === "object" && body !== null && "kind" in body ? ((body as { kind?: string }).kind as "post" | "announcement") ?? "post" : "post"
    });
    return NextResponse.json({ data: post }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
