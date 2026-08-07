import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { votePoll } from "@/server/services/posts";
import { z } from "zod";

const voteSchema = z.object({ optionIndex: z.number().int().min(0) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await getApiUser(req.headers);
    const { id } = await params;
    const { optionIndex } = voteSchema.parse(await readJson(req));
    const result = await votePoll(user.id, id, optionIndex);
    return NextResponse.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}
