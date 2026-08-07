import { createHash, randomBytes } from "crypto";

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

// hmac-sha256, used by webhook verification + csrf
export function hmac(secret: string, input: string): string {
  return createHash("sha256").update(`${secret}:${input}`).digest("hex");
}

export function timingSafeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return createHash("sha256").update(ba).update(bb).digest().length === 32 && a === b;
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `ojr_${randomBytes(24).toString("base64url")}`;
  return {
    key,
    prefix: `${key.slice(0, 10)}...`,
    hash: sha256(key)
  };
}
