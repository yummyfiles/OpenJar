import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { goalSchema } from "@/lib/validations";
import { createGoal } from "@/server/services/content";

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const input = goalSchema.parse(await readJson(req));
    const goal = await createGoal(user.id, {
      title: input.title,
      description: input.description ?? undefined,
      amount: input.amount,
      deadline: input.deadline ? new Date(input.deadline) : null
    });
    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
