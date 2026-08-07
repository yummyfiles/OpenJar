import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { tierSchema } from "@/lib/validations";
import { createTier, updateTier, deleteTier } from "@/server/services/content";

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const input = tierSchema.parse(await readJson(req));
    const tier = await createTier(user.id, {
      name: input.name,
      description: input.description ?? undefined,
      price: input.price,
      currency: input.currency,
      perks: input.perks
    });
    return NextResponse.json({ data: tier }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const input = tierSchema.partial().parse(await readJson(req));
    const tier = await updateTier(user.id, id, input as never);
    return NextResponse.json({ data: tier });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    await deleteTier(user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
