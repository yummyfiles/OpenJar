import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";

// CRUD for creator-managed content (tiers, goals, projects) with ownership checks.
// Shared by the REST API and dashboard.

export async function createTier(creatorId: string, input: { name: string; description?: string; price: number; currency?: string; perks?: string[] }) {
  const count = await prisma.tier.count({ where: { creatorId } });
  if (count >= 10) throw new ApiError(400, "You can have up to 10 membership tiers");
  return prisma.tier.create({
    data: {
      creatorId,
      name: input.name,
      description: input.description || null,
      price: input.price,
      currency: (input.currency ?? "usd").toLowerCase(),
      perks: input.perks ?? [],
      sortOrder: count
    }
  });
}

export async function updateTier(creatorId: string, tierId: string, input: Record<string, unknown>) {
  const tier = await prisma.tier.findFirst({ where: { id: tierId, creatorId } });
  if (!tier) throw new ApiError(404, "Tier not found");
  return prisma.tier.update({ where: { id: tierId }, data: input });
}

export async function deleteTier(creatorId: string, tierId: string) {
  const tier = await prisma.tier.findFirst({ where: { id: tierId, creatorId } });
  if (!tier) throw new ApiError(404, "Tier not found");
  await prisma.tier.delete({ where: { id: tierId } });
  return { ok: true };
}

export async function createGoal(creatorId: string, input: { title: string; description?: string; amount: number; deadline?: Date | null }) {
  const count = await prisma.goal.count({ where: { creatorId } });
  if (count >= 20) throw new ApiError(400, "You can have up to 20 goals");
  return prisma.goal.create({
    data: {
      creatorId,
      title: input.title,
      description: input.description || null,
      amount: input.amount,
      deadline: input.deadline ?? null
    }
  });
}

export async function updateGoal(creatorId: string, goalId: string, input: Record<string, unknown>) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, creatorId } });
  if (!goal) throw new ApiError(404, "Goal not found");
  return prisma.goal.update({ where: { id: goalId }, data: input });
}

export async function deleteGoal(creatorId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({ where: { id: goalId, creatorId } });
  if (!goal) throw new ApiError(404, "Goal not found");
  await prisma.goal.delete({ where: { id: goalId } });
  return { ok: true };
}

export async function createProject(creatorId: string, input: { name: string; slug?: string; description?: string; repoUrl?: string; website?: string; tags?: string[] }) {
  const count = await prisma.project.count({ where: { creatorId } });
  if (count >= 50) throw new ApiError(400, "You can have up to 50 projects");
  return prisma.project.create({
    data: {
      creatorId,
      name: input.name,
      slug: input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 80) || null,
      description: input.description || null,
      repoUrl: input.repoUrl || null,
      website: input.website || null,
      tags: input.tags ?? []
    }
  });
}

export async function updateProject(creatorId: string, projectId: string, input: Record<string, unknown>) {
  const project = await prisma.project.findFirst({ where: { id: projectId, creatorId } });
  if (!project) throw new ApiError(404, "Project not found");
  return prisma.project.update({ where: { id: projectId }, data: input });
}

export async function deleteProject(creatorId: string, projectId: string) {
  const project = await prisma.project.findFirst({ where: { id: projectId, creatorId } });
  if (!project) throw new ApiError(404, "Project not found");
  await prisma.project.delete({ where: { id: projectId } });
  return { ok: true };
}

// everything the dashboard "content" tab needs in one call
export async function getOwnedContent(creatorId: string) {
  const [tiers, goals, projects, posts] = await Promise.all([
    prisma.tier.findMany({ where: { creatorId }, orderBy: { sortOrder: "asc" } }),
    prisma.goal.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ where: { creatorId }, orderBy: { createdAt: "desc" } }),
    prisma.post.findMany({
      where: { authorId: creatorId, status: { in: ["published", "draft", "scheduled"] } },
      orderBy: { updatedAt: "desc" },
      take: 100,
      include: { _count: { select: { likes: true, comments: true } } }
    })
  ]);

  return { tiers, goals, projects, posts };
}
