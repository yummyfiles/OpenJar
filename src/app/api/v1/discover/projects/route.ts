import { NextResponse } from "next/server";
import { handleError } from "@/lib/api";
import { discoverProjects } from "@/server/services/creators";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const rl = rateLimit(clientIp(req), { key: "discover-projects", limit: 60 });
    if (!rl.success) {
      return NextResponse.json({ error: { code: "rate_limited", message: "Slow down" } }, { status: 429 });
    }

    const url = new URL(req.url);
    const result = await discoverProjects({
      q: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      language: url.searchParams.get("language") ?? undefined,
      sort: (url.searchParams.get("sort") as never) ?? undefined,
      page: Number(url.searchParams.get("page") ?? 1),
      perPage: Number(url.searchParams.get("perPage") ?? 18)
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    return handleError(err);
  }
}
