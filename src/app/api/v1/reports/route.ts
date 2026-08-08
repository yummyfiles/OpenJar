import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { reportSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = await rateLimit(clientIp(req), { key: "reports", limit: 10 });
    if (!rl.success) {
      return NextResponse.json({ error: { code: "rate_limited", message: "Too many reports" } }, { status: 429 });
    }

    const { user } = await getApiUser(req.headers).catch(() => ({ user: null as never }));
    const input = reportSchema.parse(await readJson(req));
    const report = await prisma.report.create({
      data: {
        reporterId: user?.id ?? null,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details || null
      }
    });
    return NextResponse.json({ data: report }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
