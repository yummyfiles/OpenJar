import { prisma } from "@/lib/prisma";
import type { Notification } from "@prisma/client";

export interface NotifyInput {
  userId: string;
  actorId?: string;
  type: Notification["type"];
  title: string;
  body?: string;
  link?: string;
}

export async function notify(input: NotifyInput) {
  if (input.actorId && input.actorId === input.userId) return null;
  return prisma.notification.create({ data: input });
}

export async function notifyMany(userIds: string[], input: Omit<NotifyInput, "userId">) {
  const unique = [...new Set(userIds)].filter((id) => id !== input.actorId);
  if (unique.length === 0) return;
  await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      ...input
    }))
  });
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}

export async function listNotifications(userId: string, limit = 30) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: { id: true, name: true, username: true, image: true, displayName: true } }
    }
  });
}
