import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { deleteComment } from "@/server/services/posts";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const isAdmin = user.role === "admin" || user.role === "moderator";
    await deleteComment(user.id, id, isAdmin);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
