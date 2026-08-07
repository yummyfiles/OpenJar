import { sha256 } from "@/lib/crypto";

// tiny in-memory sliding-window rate limiter. good enough for a single
// instance; swap for redis in multi-instance deployments.
const buckets = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;

export interface RateLimitOptions {
  limit: number;
  windowMs?: number;
  key?: string;
}

export function rateLimit(ip: string, opts: RateLimitOptions) {
  const windowMs = opts.windowMs ?? WINDOW_MS;
  const key = `${ip}:${opts.key ?? "default"}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  const remaining = Math.max(0, opts.limit - bucket.count);

  // dont let the map grow forever
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt < now) buckets.delete(k);
    }
  }

  return {
    success: bucket.count <= opts.limit,
    limit: opts.limit,
    remaining,
    resetAt: bucket.resetAt
  };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
