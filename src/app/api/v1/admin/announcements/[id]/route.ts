import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { assertAdmin, deleteAnnouncement } from "@/server/services/admin";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const { id } = await params;
    await deleteAnnouncement(id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
