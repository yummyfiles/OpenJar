import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { goalSchema } from "@/lib/validations";
import { createGoal, updateGoal, deleteGoal } from "@/server/services/content";

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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const input = goalSchema.partial().parse(await readJson(req));
    const data: Record<string, unknown> = { ...input };
    if (input.deadline !== undefined) data.deadline = input.deadline ? new Date(input.deadline) : null;
    const goal = await updateGoal(user.id, id, data);
    return NextResponse.json({ data: goal });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    await deleteGoal(user.id, id);
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
