import { NextResponse } from "next/server";
import { ApiError, getOptionalUser, handleError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { donationIntentSchema } from "@/lib/validations";
import { createCheckout } from "@/server/services/donations";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request, { params }: { params: Promise<{ username: string }> }) {
  try {
    const { username } = await params;

    // keep checkout creation from being spammed
    const rl = rateLimit(clientIp(req), { key: `donate:${username}`, limit: 20 });
    if (!rl.success) {
      return NextResponse.json(
        { error: { code: "rate_limited", message: "Too many attempts, slow down" } },
        { status: 429, headers: { "x-ratelimit-remaining": "0" } }
      );
    }

    const creator = await prisma.user.findFirst({
      where: { username },
      select: { id: true, minDonation: true, allowAnonymous: true, allowMessages: true, currency: true, isCreator: true }
    });
    if (!creator || !creator.isCreator) throw new ApiError(404, "Creator not found");

    const { user: supporter } = await getOptionalUser(req.headers);
    const input = donationIntentSchema.parse(await readJson(req));

    const base = process.env.BASE_URL ?? "http://localhost:3000";
    const result = await createCheckout({
      creator,
      supporter,
      amount: input.amount,
      currency: input.currency,
      kind: input.kind,
      tierId: input.tierId,
      interval: input.interval,
      message: input.message,
      anonymous: input.anonymous,
      redirectTo: `${base}/${username}`,
      source: "web"
    });

    return NextResponse.json({ data: result.intent }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
