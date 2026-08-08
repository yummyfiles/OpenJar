import { Redis } from "@upstash/redis";
import { sha256 } from "@/lib/crypto";

// Distributed sliding-window rate limiter. When UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN are set (Vercel KV / Upstash), counters live in
// Redis so they work across serverless instances. Otherwise we fall back to
// an in-memory map, which is fine for a single-instance deploy.

const WINDOW_MS = 60_000;

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN
      })
    : null;

export interface RateLimitOptions {
  limit: number;
  windowMs?: number;
  key?: string;
}

// fixed-window counter. simpler than sliding window and plenty accurate for
// the abuse cases we care about (spam, brute force, scraping).
export async function rateLimit(ip: string, opts: RateLimitOptions): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}> {
  const windowMs = opts.windowMs ?? WINDOW_MS;
  const key = `rl:${sha256(`${ip}:${opts.key ?? "default"}`).slice(0, 24)}`;

  if (redis) {
    try {
      const now = Date.now();
      const windowStart = Math.floor(now / windowMs) * windowMs;
      const bucket = `${key}:${windowStart}`;
      const count = await redis.incr(bucket);
      if (count === 1) {
        // one window's worth of time is enough — no need to expire earlier
        await redis.expire(bucket, Math.ceil(windowMs / 1000) + 1).catch(() => {});
      }
      return {
        success: count <= opts.limit,
        limit: opts.limit,
        remaining: Math.max(0, opts.limit - count),
        resetAt: windowStart + windowMs
      };
    } catch (err) {
      console.error("[rate-limit] redis error, falling back to memory", err);
    }
  }

  return memoryRateLimit(key, opts, windowMs);
}

const buckets = new Map<string, { count: number; resetAt: number }>();

function memoryRateLimit(key: string, opts: RateLimitOptions, windowMs: number) {
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
