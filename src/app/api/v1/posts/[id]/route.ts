import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { postSchema } from "@/lib/validations";
import { updatePost, deletePost, getPostById } from "@/server/services/posts";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (post && post.status === "published") {
      return NextResponse.json({ data: post });
    }
    const { user } = await getApiUser(req.headers);
    if (!user || user.id !== post?.authorId) throw new ApiError(404, "Post not found");
    return NextResponse.json({ data: post });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const body = await readJson(req);
    const input = postSchema.partial().parse(body);
    const post = await updatePost(user.id, id, {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      status: input.status,
      pinned: input.pinned,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : input.scheduledAt === null ? null : undefined,
      poll: input.poll
    });
    return NextResponse.json({ data: post });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    await deletePost(user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
