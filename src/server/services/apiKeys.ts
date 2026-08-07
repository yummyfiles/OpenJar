import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { generateApiKey } from "@/lib/crypto";

export async function createApiKey(userId: string, name: string, scopes: string[]) {
  const count = await prisma.apiKey.count({ where: { userId } });
  if (count >= 10) throw new ApiError(400, "You have reached the API key limit (10)");

  const { key, prefix, hash } = generateApiKey();
  await prisma.apiKey.create({
    data: { userId, name, prefix, keyHash: hash, scopes }
  });

  // only returned once — the raw key is never stored
  return { key, prefix, name, scopes };
}

export async function listApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      prefix: true,
      scopes: true,
      lastUsedAt: true,
      createdAt: true,
      expiresAt: true,
      revoked: true
    }
  });
}

export async function revokeApiKey(userId: string, keyId: string) {
  const key = await prisma.apiKey.findFirst({ where: { id: keyId, userId } });
  if (!key) throw new ApiError(404, "API key not found");
  await prisma.apiKey.update({ where: { id: keyId }, data: { revoked: true } });
  return { ok: true };
}

export async function getApiKeyScopes(userId: string) {
  const keys = await prisma.apiKey.findMany({ where: { userId, revoked: false } });
  return new Set(keys.flatMap((k) => k.scopes));
}
