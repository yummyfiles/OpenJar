import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { ADMIN_ROLES } from "@/lib/constants";
import { notify } from "./notifications";
import { trackActivity } from "./activity";

export { ADMIN_ROLES };

export function assertAdmin(user: { role: string }) {
  if (!ADMIN_ROLES.includes(user.role)) throw new ApiError(403, "Admin access required", "forbidden");
}

export async function adminStats() {
  const [users, creators, donations, revenue, reports, pendingVerifications, monthStart] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isCreator: true } }),
    prisma.donation.count({ where: { status: "completed" } }),
    prisma.donation.aggregate({ where: { status: "completed" }, _sum: { amount: true } }),
    prisma.report.count({ where: { status: "open" } }),
    prisma.verificationRequest.count({ where: { status: "pending" } }),
    new Date(new Date().setDate(1)).toISOString()
  ]);

  const monthlyRevenue = await prisma.donation.aggregate({
    where: { status: "completed", createdAt: { gte: new Date(monthStart) } },
    _sum: { amount: true }
  });

  return {
    users,
    creators,
    donations,
    revenue: revenue._sum.amount ?? 0,
    monthlyRevenue: monthlyRevenue._sum.amount ?? 0,
    reports,
    pendingVerifications
  };
}

export async function listUsers(opts: { q?: string; role?: string; page?: number; perPage?: number }) {
  const page = opts.page ?? 1;
  const perPage = opts.perPage ?? 25;
  const where: Record<string, unknown> = {
    ...(opts.role ? { role: opts.role } : {}),
    ...(opts.q
      ? {
          OR: [
            { username: { contains: opts.q, mode: "insensitive" } },
            { email: { contains: opts.q, mode: "insensitive" } },
            { displayName: { contains: opts.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        username: true,
        displayName: true,
        name: true,
        email: true,
        image: true,
        role: true,
        verified: true,
        banned: true,
        isCreator: true,
        createdAt: true
      }
    }),
    prisma.user.count({ where })
  ]);

  return { users, total, page, perPage };
}

export async function setUserRole(actorId: string, targetId: string, role: string) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "admin") throw new ApiError(403, "Only admins can change roles");
  if (role === "admin" && actor.id === targetId) throw new ApiError(400, "You cant demote yourself");

  await prisma.user.update({ where: { id: targetId }, data: { role } });
  return { ok: true };
}

export async function banUser(actorId: string, targetId: string, reason?: string, unban = false) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "admin") throw new ApiError(403, "Only admins can ban users");
  if (actor.id === targetId) throw new ApiError(400, "You cant ban yourself");

  await prisma.user.update({
    where: { id: targetId },
    data: unban ? { banned: false, banReason: null } : { banned: true, banReason: reason ?? null }
  });

  if (!unban) {
    await notify({
      userId: targetId,
      type: "system",
      title: "Your account has been banned",
      body: reason ?? "Violation of the OpenJar guidelines."
    });
  }
  return { ok: true };
}

export async function verifyUser(actorId: string, targetId: string, note?: string) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "admin") throw new ApiError(403, "Only admins can verify creators");

  await prisma.user.update({ where: { id: targetId }, data: { verified: true, verifiedNote: note ?? null } });
  await prisma.verificationRequest.deleteMany({ where: { userId: targetId } });

  await notify({
    userId: targetId,
    type: "system",
    title: "You are verified",
    body: "Your creator page now shows the verified badge."
  });
  return { ok: true };
}

export async function listVerificationRequests() {
  return prisma.verificationRequest.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          name: true,
          email: true,
          image: true,
          verified: true,
          website: true,
          github: true
        }
      }
    }
  });
}

export async function decideVerification(actorId: string, requestId: string, approve: boolean) {
  const actor = await prisma.user.findUnique({ where: { id: actorId } });
  if (!actor || actor.role !== "admin") throw new ApiError(403, "Only admins can decide verification");

  const request = await prisma.verificationRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new ApiError(404, "Request not found");

  await prisma.verificationRequest.update({
    where: { id: requestId },
    data: { status: approve ? "approved" : "rejected", handledAt: new Date(), handledBy: actorId }
  });

  if (approve) {
    await prisma.user.update({ where: { id: request.userId }, data: { verified: true } });
  }

  await notify({
    userId: request.userId,
    type: "system",
    title: approve ? "Your verification was approved" : "Your verification request was declined",
    body: approve ? "Your creator page now shows the verified badge." : "You can apply again anytime."
  });
  return { ok: true };
}

export async function listReports(status?: string) {
  return prisma.report.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { id: true, username: true, displayName: true, image: true } }
    }
  });
}

export async function updateReportStatus(actorId: string, reportId: string, status: string) {
  await prisma.report.update({
    where: { id: reportId },
    data: { status, resolvedAt: status === "open" ? null : new Date(), handledBy: actorId }
  });
  return { ok: true };
}

export async function setFeatured(creatorId: string, label: string, slot = 0) {
  const creator = await prisma.user.findUnique({ where: { id: creatorId } });
  if (!creator) throw new ApiError(404, "Creator not found");

  await prisma.featuredCreator.upsert({
    where: { creatorId_label: { creatorId, label } },
    create: { creatorId, label, slot },
    update: { slot }
  });

  await trackActivity(creatorId, "milestone", { featured: label });
  await notify({
    userId: creatorId,
    type: "system",
    title: `You were featured${label !== "featured" ? ` (${label})` : ""}!`,
    body: "Your page now appears on the OpenJar homepage.",
    link: "/"
  });
  return { ok: true };
}

export async function removeFeatured(creatorId: string, label: string) {
  await prisma.featuredCreator.deleteMany({ where: { creatorId, label } });
  return { ok: true };
}

export async function listAnnouncements() {
  return prisma.announcement.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
}

export async function createAnnouncement(title: string, content: string) {
  return prisma.announcement.create({ data: { title, content } });
}

export async function deleteAnnouncement(id: string) {
  await prisma.announcement.delete({ where: { id } });
  return { ok: true };
}
