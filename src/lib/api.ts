import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { ZodError } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, message: string, code = "error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function ok(data: unknown, init?: { status?: number; headers?: HeadersInit }) {
  return NextResponse.json({ data }, init);
}

export function fail(status: number, message: string, code = "error", extra: Record<string, unknown> = {}) {
  return NextResponse.json({ error: { code, message, ...extra } }, { status });
}

export function handleError(err: unknown) {
  if (err instanceof ApiError) {
    return fail(err.status, err.message, err.code);
  }
  if (err instanceof ZodError) {
    return fail(400, "Invalid request", "validation_error", {
      fields: err.flatten().fieldErrors
    });
  }
  console.error("[api] unhandled:", err);
  try {
    Sentry.captureException(err);
  } catch {
    // sentry should never break the request path
  }
  return fail(500, "Something went wrong", "internal");
}

// authenticates either the session cookie or an API key
export async function getApiUser(headers: Headers) {
  // api key auth takes precedence
  const key = headers.get("x-openjar-key");
  if (key) {
    const { sha256 } = await import("@/lib/crypto");
    const keyHash = sha256(key);
    const apiKey = await prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: true }
    });
    if (!apiKey || apiKey.revoked || (apiKey.expiresAt && apiKey.expiresAt < new Date())) {
      throw new ApiError(401, "Invalid or expired API key", "unauthorized");
    }
    prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } }).catch(() => {});
    return { user: apiKey.user, via: "key" as const };
  }

  const session = await getSession();
  if (!session?.user) throw new ApiError(401, "Authentication required", "unauthorized");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new ApiError(401, "Authentication required", "unauthorized");
  if (user.banned) throw new ApiError(403, "This account has been banned", "banned");
  return { user, via: "session" as const };
}

export function requireRole(user: { role: string }, roles: string[]) {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "You do not have permission to do that", "forbidden");
  }
}

// like getApiUser but tolerates being logged out — used by guest donation flow
export async function getOptionalUser(headers: Headers) {
  if (headers.get("x-openjar-key")) return getApiUser(headers);
  const session = await getSession();
  if (!session?.user) return { user: null as never, via: "guest" as const };
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { user: null as never, via: "guest" as const };
  if (user.banned) throw new ApiError(403, "This account has been banned", "banned");
  return { user, via: "session" as const };
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, "Invalid JSON body", "bad_request");
  }
}
