import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { revokeApiKey } from "@/server/services/apiKeys";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    await revokeApiKey(user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
