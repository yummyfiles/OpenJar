import { prisma } from "@/lib/prisma";

// public activity feed items, e.g. "yummyfiles raised a goal", "nora posted"
export async function trackActivity(creatorId: string, type: string, payload?: Record<string, unknown>) {
  return prisma.activityEvent.create({
    data: { creatorId, type, payload: (payload ?? {}) as object }
  });
}

export async function listActivity(creatorId: string, limit = 20) {
  return prisma.activityEvent.findMany({
    where: { creatorId, public: true },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
