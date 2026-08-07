import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { apiKeySchema } from "@/lib/validations";
import { createApiKey, listApiKeys } from "@/server/services/apiKeys";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const keys = await listApiKeys(user.id);
    return NextResponse.json({ data: keys });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const input = apiKeySchema.parse(await readJson(req));
    const result = await createApiKey(user.id, input.name, input.scopes);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
