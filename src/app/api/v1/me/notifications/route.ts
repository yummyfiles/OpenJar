import { NextResponse } from "next/server";
import { getApiUser, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { listNotifications } from "@/server/services/notifications";

export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 30), 100);
    const notifications = await listNotifications(user.id, limit);
    const unread = await prisma.notification.count({ where: { userId: user.id, read: false } });
    return NextResponse.json({ data: { notifications, unread } });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
    return NextResponse.json({ data: { ok: true } });
  } catch (err) {
    return handleError(err);
  }
}
