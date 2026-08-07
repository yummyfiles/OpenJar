import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { assertAdmin, updateReportStatus } from "@/server/services/admin";
import { z } from "zod";

const schema = z.object({ status: z.enum(["open", "investigating", "resolved", "dismissed"]) });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const { id } = await params;
    const { status } = schema.parse(await readJson(req));
    await updateReportStatus(user.id, id, status);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
