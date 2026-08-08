import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordView } from "@/server/services/analytics";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// lightweight view beacon fired from creator pages. throttled per visitor so
// a refresh-happy user doesn't flood the analytics table.
export async function POST(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;
    const rl = await rateLimit(clientIp(req), { key: `view:${username}`, limit: 60 });
    if (!rl.success) return NextResponse.json({ data: { ok: true } });

    const creator = await prisma.user.findFirst({ where: { username }, select: { id: true } });
    if (!creator) return NextResponse.json({ data: { ok: true } }, { status: 404 });

    await recordView(creator.id);
    return NextResponse.json({ data: { ok: true } });
  } catch {
    // views are best-effort, never fail the page over them
    return NextResponse.json({ data: { ok: true } });
  }
}
