import { prisma } from "@/lib/prisma";

export async function recordView(creatorId: string) {
  await prisma.pageView.create({ data: { creatorId } }).catch(() => {});
}

interface DailyRow {
  day: Date;
  count: bigint;
}
interface DailyAmountRow extends DailyRow {
  amount: bigint;
}

export async function getAnalytics(creatorId: string, days = 30) {
  const since = new Date(Date.now() - days * 86_400_000);

  const [views, donations, totalViews, totalDonations] = await Promise.all([
    prisma.$queryRaw<DailyRow[]>`
      SELECT date_trunc('day', "viewedAt") AS day, COUNT(*) AS count
      FROM "PageView"
      WHERE "creatorId" = ${creatorId} AND "viewedAt" >= ${since}
      GROUP BY 1 ORDER BY 1
    `,
    prisma.$queryRaw<DailyAmountRow[]>`
      SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS count, COALESCE(SUM("amount"), 0) AS amount
      FROM "Donation"
      WHERE "creatorId" = ${creatorId} AND status = 'completed' AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1
    `,
    prisma.pageView.count({ where: { creatorId, viewedAt: { gte: since } } }),
    prisma.donation.count({ where: { creatorId, status: "completed", createdAt: { gte: since } } })
  ]);

  const series = buildSeries(days, views, donations);

  return {
    days,
    series,
    totals: {
      views: totalViews,
      donations: totalDonations,
      conversion: totalViews > 0 ? (totalDonations / totalViews) * 100 : 0
    }
  };
}

// fills missing days with zeroes so charts render a continuous line
function buildSeries(days: number, views: DailyRow[], donations: DailyAmountRow[]) {
  const viewMap = new Map(views.map((r) => [dayKey(r.day), Number(r.count)]));
  const donMap = new Map(donations.map((r) => [dayKey(r.day), { count: Number(r.count), amount: Number(r.amount) }]));

  const out: { date: string; views: number; donations: number; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86_400_000);
    const key = dayKey(d);
    out.push({
      date: key,
      views: viewMap.get(key) ?? 0,
      donations: donMap.get(key)?.count ?? 0,
      revenue: donMap.get(key)?.amount ?? 0
    });
  }
  return out;
}

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getDashboardOverview(creatorId: string) {
  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    monthly,
    yearly,
    allTime,
    subscriberCount,
    supporterCount,
    recentDonations,
    recentFollowers,
    goals,
    tierCount,
    postCount
  ] = await Promise.all([
    prisma.donation.aggregate({ where: { creatorId, status: "completed", createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.donation.aggregate({ where: { creatorId, status: "completed", createdAt: { gte: yearStart } }, _sum: { amount: true } }),
    prisma.donation.aggregate({ where: { creatorId, status: "completed" }, _sum: { amount: true } }),
    prisma.subscription.count({ where: { creatorId, status: "active" } }),
    prisma.donation.count({ where: { creatorId, status: "completed" } }),
    prisma.donation.findMany({
      where: { creatorId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { supporter: { select: { id: true, username: true, displayName: true, name: true, image: true } } }
    }),
    prisma.follow.findMany({
      where: { followingId: creatorId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { follower: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } } }
    }),
    prisma.goal.findMany({
      where: { creatorId },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.tier.count({ where: { creatorId } }),
    prisma.post.count({ where: { authorId: creatorId } })
  ]);

  // progress per goal
  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const raised = await prisma.donation.aggregate({
        where: { creatorId, status: "completed", createdAt: { gte: goal.createdAt } },
        _sum: { amount: true }
      });
      return { ...goal, raised: raised._sum.amount ?? 0 };
    })
  );

  return {
    revenue: {
      monthly: monthly._sum.amount ?? 0,
      yearly: yearly._sum.amount ?? 0,
      allTime: allTime._sum.amount ?? 0
    },
    counts: {
      subscribers: subscriberCount,
      supporters: supporterCount,
      tiers: tierCount,
      posts: postCount
    },
    recentDonations,
    recentFollowers,
    goals: goalsWithProgress
  };
}
