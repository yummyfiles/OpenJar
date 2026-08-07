import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { saveUpload } from "@/server/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const rl = rateLimit(clientIp(req), { key: "upload", limit: 30 });
    if (!rl.success) {
      return NextResponse.json({ error: { code: "rate_limited", message: "Too many uploads" } }, { status: 429 });
    }

    const { user } = await getApiUser(req.headers);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: { code: "bad_request", message: "No file provided" } }, { status: 400 });
    }

    const folder = String(form.get("folder") ?? "uploads");
    const { url } = await saveUpload(file, folder);
    return NextResponse.json({ data: { url } }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
