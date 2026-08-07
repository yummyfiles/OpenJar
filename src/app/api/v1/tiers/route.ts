import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { tierSchema } from "@/lib/validations";
import { createTier } from "@/server/services/content";

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
