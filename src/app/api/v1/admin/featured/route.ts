import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { assertAdmin, setFeatured, removeFeatured } from "@/server/services/admin";
import { featuredSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const items = await prisma.featuredCreator.findMany({
      orderBy: [{ label: "asc" }, { slot: "asc" }],
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, name: true, image: true, verified: true }
        }
      }
    });
    return NextResponse.json({ data: items });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const input = featuredSchema.parse(await readJson(req));
    await setFeatured(input.creatorId, input.label, input.slot);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const input = featuredSchema.pick({ creatorId: true, label: true }).parse(await readJson(req));
    await removeFeatured(input.creatorId, input.label);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
