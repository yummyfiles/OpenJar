import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { notify } from "./notifications";
import { trackActivity } from "./activity";

export async function toggleFollow(followerId: string, targetUsername: string) {
  if (followerId === targetUsername) throw new ApiError(400, "Invalid target");

  const target = await prisma.user.findFirst({ where: { username: targetUsername } });
  if (!target) throw new ApiError(404, "User not found");
  if (followerId === target.id) throw new ApiError(400, "You cant follow yourself");

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: target.id } }
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({ data: { followerId, followingId: target.id } });
  await trackActivity(target.id, "follow", {});
  await notify({
    userId: target.id,
    actorId: followerId,
    type: "follow",
    title: "You have a new follower",
    link: `/${target.username}/followers`
  });

  return { following: true };
}

export async function isFollowing(followerId: string, targetId: string) {
  if (!followerId) return false;
  return (await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: targetId } }
  }))
    ? true
    : false;
}

export async function toggleBookmark(userId: string, creatorUsername: string) {
  const creator = await prisma.user.findFirst({ where: { username: creatorUsername } });
  if (!creator) throw new ApiError(404, "Creator not found");

  const existing = await prisma.bookmark.findUnique({
    where: { userId_creatorId: { userId, creatorId: creator.id } }
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return { bookmarked: false };
  }

  await prisma.bookmark.create({ data: { userId, creatorId: creator.id } });
  return { bookmarked: true };
}

export async function getFollowers(username: string, page = 1, perPage = 30) {
  const creator = await prisma.user.findFirst({ where: { username } });
  if (!creator) throw new ApiError(404, "User not found");

  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: creator.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        follower: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } }
      }
    }),
    prisma.follow.count({ where: { followingId: creator.id } })
  ]);

  return { users: follows.map((f) => f.follower), total, page, perPage };
}

export async function getFollowing(username: string, page = 1, perPage = 30) {
  const creator = await prisma.user.findFirst({ where: { username } });
  if (!creator) throw new ApiError(404, "User not found");

  const [follows, total] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: creator.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        following: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } }
      }
    }),
    prisma.follow.count({ where: { followerId: creator.id } })
  ]);

  return { users: follows.map((f) => f.following), total, page, perPage };
}
