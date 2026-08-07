import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);

    const subscriptions = await prisma.subscription.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        supporter: { select: { id: true, username: true, displayName: true, name: true, image: true } },
        tier: { select: { id: true, name: true, price: true, currency: true } }
      }
    });

    return NextResponse.json({ data: subscriptions });
  } catch (err) {
    return handleError(err);
  }
}
