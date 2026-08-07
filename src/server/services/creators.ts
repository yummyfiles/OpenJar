import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { DISCOVER_PAGE_SIZE } from "@/lib/constants";
import { getGitHubPageData } from "./github";

export const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  name: true,
  bio: true,
  image: true,
  banner: true,
  website: true,
  github: true,
  twitter: true,
  youtube: true,
  twitch: true,
  location: true,
  verified: true,
  verifiedNote: true,
  isCreator: true,
  category: true,
  tags: true,
  currency: true,
  monthlyGoal: true,
  allowAnonymous: true,
  allowMessages: true,
  minDonation: true,
  themeMode: true,
  accent: true,
  monoBranding: true,
  createdAt: true,
  customLinks: true
} as const;

export function getPublicUser(user: { [K in keyof typeof publicUserSelect]: unknown }) {
  return user;
}

export async function findCreatorByUsername(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
    select: publicUserSelect
  });
  return user;
}

export async function findCreatorById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect
  });
  return user;
}

// everything a creator page needs, in as few queries as possible
export async function getCreatorPageData(username: string, viewerId?: string | null) {
  const user = await findCreatorByUsername(username);
  if (!user || !user.isCreator) return null;

  const [tiers, projects, posts, goals, followers, following, gh, summary] = await Promise.all([
    prisma.tier.findMany({
      where: { creatorId: user.id, active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, description: true, price: true, currency: true, perks: true, sortOrder: true }
    }),
    prisma.project.findMany({
      where: { creatorId: user.id },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 12
    }),
    prisma.post.findMany({
      where: { authorId: user.id, status: "published", publishedAt: { not: null } },
      orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        pinned: true,
        publishedAt: true,
        createdAt: true,
        _count: { select: { likes: true, comments: true } },
        author: { select: { username: true } }
      }
    }),
    prisma.goal.findMany({
      where: { creatorId: user.id },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        amount: true,
        deadline: true,
        completed: true,
        completedAt: true,
        createdAt: true
      }
    }),
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
    getGitHubPageData(user.id),
    getCreatorSummary(user.id)
  ]);

  const supporterCount = await prisma.subscription.count({ where: { creatorId: user.id, status: "active" } });

  // progress for goals = completed donations raised since each goal was created
  const goalsWithRaised = await Promise.all(
    goals.map(async (goal) => {
      const raised =
        (await prisma.donation.aggregate({
          where: { creatorId: user.id, status: "completed", createdAt: { gte: goal.createdAt } },
          _sum: { amount: true }
        }))._sum.amount ?? 0;
      return { ...goal, raised };
    })
  );

  const viewerState = viewerId
    ? {
        following: (await prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: viewerId, followingId: user.id } }
        }))
          ? true
          : false,
        bookmarked: (await prisma.bookmark.findUnique({
          where: { userId_creatorId: { userId: viewerId, creatorId: user.id } }
        }))
          ? true
          : false
      }
    : { following: false, bookmarked: false };

  const pinnedContent = {
    post: posts.find((p) => p.pinned) ?? null,
    project: projects.find((p) => p.pinned) ?? null
  };

  return {
    user,
    tiers,
    projects,
    posts,
    goals: goalsWithRaised,
    pinnedContent,
    counts: { followers, following, supporters: supporterCount },
    github: gh,
    summary,
    viewerState
  };
}

export async function getCreatorSummary(creatorId: string) {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [monthly, total, recent] = await Promise.all([
    prisma.donation.aggregate({
      where: { creatorId, status: "completed", createdAt: { gte: monthStart } },
      _sum: { amount: true }
    }),
    prisma.donation.aggregate({
      where: { creatorId, status: "completed" },
      _sum: { amount: true }
    }),
    prisma.donation.findMany({
      where: { creatorId, status: "completed", anonymous: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        currency: true,
        message: true,
        anonymous: true,
        createdAt: true,
        supporterId: true,
        supporterName: true,
        supporter: { select: { id: true, username: true, displayName: true, name: true, image: true } }
      }
    })
  ]);

  return {
    monthlyRaised: monthly._sum.amount ?? 0,
    totalRaised: total._sum.amount ?? 0,
    recentSupporters: recent.map((d) => ({
      ...d,
      displayName: d.anonymous ? null : d.supporterName ?? d.supporter?.displayName ?? d.supporter?.name ?? "Supporter"
    }))
  };
}

export interface DiscoverFilters {
  q?: string;
  category?: string;
  language?: string;
  sort?: "trending" | "newest" | "featured" | "recommended";
  page?: number;
  perPage?: number;
}

export async function discoverCreators(filters: DiscoverFilters) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DISCOVER_PAGE_SIZE;
  const where: Record<string, unknown> = {
    isCreator: true,
    banned: false,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.q
      ? {
          OR: [
            { username: { contains: filters.q, mode: "insensitive" } },
            { displayName: { contains: filters.q, mode: "insensitive" } },
            { name: { contains: filters.q, mode: "insensitive" } },
            { bio: { contains: filters.q, mode: "insensitive" } }
          ]
        }
      : {})
  };

  const orderBy =
    filters.sort === "newest"
      ? [{ createdAt: "desc" as const }]
      : filters.sort === "featured"
        ? [{ verified: "desc" as const }, { createdAt: "desc" as const }]
        : [{ createdAt: "desc" as const }];

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage
    }),
    prisma.user.count({ where })
  ]);

  // trending = most total raised, computed on the (small) page set
  let result = users;
  if (filters.sort === "trending") {
    const raised = await Promise.all(
      users.map(async (u) => ({
        id: u.id,
        raised: (
          await prisma.donation.aggregate({
            where: { creatorId: u.id, status: "completed" },
            _sum: { amount: true }
          })
        )._sum.amount ?? 0
      }))
    );
    const map = new Map(raised.map((r) => [r.id, r.raised]));
    result = [...users].sort((a, b) => (map.get(b.id) ?? 0) - (map.get(a.id) ?? 0));
    result = result.map((u) => ({ ...u, raised: map.get(u.id) ?? 0 }));
  }

  return { creators: result, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function discoverProjects(filters: DiscoverFilters) {
  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? DISCOVER_PAGE_SIZE;
  const where: Record<string, unknown> = {
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { description: { contains: filters.q, mode: "insensitive" } },
            { tags: { has: filters.q } }
          ]
        }
      : {}),
    ...(filters.category ? { tags: { has: filters.category } } : {}),
    ...(filters.language ? { tags: { has: filters.language } } : {})
  };

  const orderBy: Record<string, string>[] =
    filters.sort === "newest" ? [{ createdAt: "desc" }] : [{ likes: "desc" }, { createdAt: "desc" }];

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        creator: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } }
      }
    }),
    prisma.project.count({ where })
  ]);

  return { projects, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function featuredCreators(label: string | null, take = 6) {
  return prisma.featuredCreator.findMany({
    where: label ? { label } : {},
    orderBy: { slot: "asc" },
    take,
    include: {
      creator: {
        select: publicUserSelect
      }
    }
  });
}

export async function newCreators(take = 6) {
  return prisma.user.findMany({
    where: { isCreator: true, banned: false },
    orderBy: { createdAt: "desc" },
    take,
    select: publicUserSelect
  });
}

export async function trendingProjects(take = 6) {
  return prisma.project.findMany({
    orderBy: [{ likes: "desc" }, { createdAt: "desc" }],
    take,
    include: {
      creator: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } }
    }
  });
}

export async function activeGoals(take = 6) {
  const goals = await prisma.goal.findMany({
    where: { completed: false },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          displayName: true,
          name: true,
          image: true,
          verified: true
        }
      }
    }
  });

  // compute raised for each goal since its creation — small take so this stays cheap
  const withProgress = await Promise.all(
    goals.map(async (goal) => {
      const raised = await prisma.donation.aggregate({
        where: { creatorId: goal.creatorId, status: "completed", createdAt: { gte: goal.createdAt } },
        _sum: { amount: true }
      });
      return { ...goal, raised: raised._sum.amount ?? 0 };
    })
  );

  return withProgress.filter((g) => g.raised < g.amount);
}

export async function getCreatorForDonation(username: string) {
  const user = await prisma.user.findFirst({
    where: { username },
    select: { id: true, minDonation: true, allowAnonymous: true, allowMessages: true, currency: true, isCreator: true }
  });
  if (!user) throw new ApiError(404, "Creator not found");
  return user;
}

// enrich creator lists with total raised + follower counts for the homepage
export async function enrichCreatorsWithStats<T extends { id: string }>(creators: T[]) {
  const ids = creators.map((c) => c.id);
  const [raisedRows, followRows] = await Promise.all([
    prisma.donation.groupBy({
      by: ["creatorId"],
      where: { creatorId: { in: ids }, status: "completed" },
      _sum: { amount: true }
    }),
    prisma.follow.groupBy({
      by: ["followingId"],
      where: { followingId: { in: ids } },
      _count: { _all: true }
    })
  ]);

  const raised = new Map(raisedRows.map((r) => [r.creatorId, r._sum.amount ?? 0]));
  const follows = new Map(followRows.map((r) => [r.followingId, r._count._all]));

  return creators.map((c) => ({
    ...c,
    raised: raised.get(c.id) ?? 0,
    followers: follows.get(c.id) ?? 0
  }));
}

// everything the homepage needs in one round of queries
export async function getHomepageData() {
  const [featured, openSource, projects, newcomers, goals, announcement] = await Promise.all([
    featuredCreators("featured", 6),
    featuredCreators("open-source", 6),
    trendingProjects(6),
    newCreators(6),
    activeGoals(4),
    prisma.announcement.findFirst({ where: { active: true }, orderBy: { createdAt: "desc" } })
  ]);

  return {
    featured: await enrichCreatorsWithStats(featured.map((f) => f.creator)),
    openSource: await enrichCreatorsWithStats(openSource.map((f) => f.creator)),
    projects,
    newcomers: await enrichCreatorsWithStats(newcomers),
    goals,
    announcement
  };
}
