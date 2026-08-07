import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { assertAdmin, decideVerification } from "@/server/services/admin";
import { z } from "zod";

const schema = z.object({ approve: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const { id } = await params;
    const { approve } = schema.parse(await readJson(req));
    await decideVerification(user.id, id, approve);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
