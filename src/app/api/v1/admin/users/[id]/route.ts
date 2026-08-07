import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError, readJson } from "@/lib/api";
import { assertAdmin, setUserRole, banUser, verifyUser } from "@/server/services/admin";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["role", "ban", "unban", "verify"]),
  role: z.string().optional(),
  reason: z.string().max(500).optional(),
  note: z.string().max(500).optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const { id } = await params;
    const input = actionSchema.parse(await readJson(req));

    switch (input.action) {
      case "role":
        if (!input.role) throw new ApiError(400, "role is required");
        await setUserRole(user.id, id, input.role);
        break;
      case "ban":
        await banUser(user.id, id, input.reason);
        break;
      case "unban":
        await banUser(user.id, id, undefined, true);
        break;
      case "verify":
        await verifyUser(user.id, id, input.note);
        break;
    }

    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
