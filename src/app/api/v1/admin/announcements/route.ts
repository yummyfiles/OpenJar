import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { assertAdmin, listAnnouncements, createAnnouncement } from "@/server/services/admin";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(2000)
});

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const data = await listAnnouncements();
    return NextResponse.json({ data });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    assertAdmin(user);
    const input = schema.parse(await readJson(req));
    const announcement = await createAnnouncement(input.title, input.content);
    return NextResponse.json({ data: announcement }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
