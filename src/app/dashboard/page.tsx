import Link from "next/link";
import { getCurrentUserFull } from "@/lib/session";
import { getAnalytics } from "@/server/services/analytics";
import { prisma } from "@/lib/prisma";
import { formatAmount, timeAgo } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const user = await getCurrentUserFull();
  if (!user) return null;

  const [analytics, recent, tiers, goals] = await Promise.all([
    getAnalytics(user.id, 30),
    prisma.donation.findMany({
      where: { creatorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { supporter: { select: { id: true, username: true, displayName: true, name: true, image: true } } }
    }),
    prisma.tier.findMany({ where: { creatorId: user.id }, orderBy: { sortOrder: "asc" } }),
    prisma.goal.findMany({ where: { creatorId: user.id }, orderBy: { createdAt: "asc" } })
  ]);

  const lastRevenue = analytics.series.map((s) => s.revenue).reduce((a, b) => a + b, 0);
  const maxRevenue = Math.max(...analytics.series.map((s) => s.revenue), 1);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <p className="label-mono">views (30d)</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{analytics.totals.views}</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <p className="label-mono">donations (30d)</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{analytics.totals.donations}</p>
          <p className="mt-1 font-mono text-xs text-neutral-500">{analytics.totals.conversion.toFixed(2)}% conversion</p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <p className="label-mono">revenue (30d)</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{formatAmount(lastRevenue)}</p>
          <p className="mt-1 font-mono text-xs text-neutral-500">completed donations</p>
        </div>
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <div className="flex items-center justify-between">
          <h2 className="label-mono">revenue · last 30 days</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">USD/day</span>
        </div>
        <div className="mt-4 flex h-40 items-end gap-0.5">
          {analytics.series.map((s) => (
            <div key={s.date} className="group relative flex-1">
              <div
                className="w-full rounded-t bg-neutral-700/60 transition-colors hover:bg-white"
                style={{ height: `${Math.max((s.revenue / maxRevenue) * 100, 2)}%` }}
              />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded border border-neutral-700 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-300 opacity-0 transition-opacity group-hover:opacity-100">
                {s.date}: {formatAmount(s.revenue)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <h2 className="label-mono">recent donations</h2>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-neutral-500">No donations yet. Share your page!</p>
          ) : (
            <ul className="mt-4 divide-y divide-neutral-800/60">
              {recent.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <Avatar
                    src={d.supporter?.image ?? null}
                    alt={d.supporter?.name ?? "Supporter"}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {d.anonymous ? "Anonymous" : (d.supporter?.displayName ?? d.supporterName ?? d.supporter?.name ?? "Guest")}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(d.createdAt)}</p>
                  </div>
                  <span className="font-mono text-sm">+{formatAmount(d.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <div className="flex items-center justify-between">
              <h2 className="label-mono">membership tiers</h2>
              <Link href="/dashboard/settings" className="font-mono text-[11px] text-neutral-500 hover:text-white">
                manage
              </Link>
            </div>
            {tiers.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">No tiers yet. Set up memberships in settings.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {tiers.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-neutral-800/60 px-3 py-2 text-sm">
                    <span>{t.name}</span>
                    <span className="font-mono text-xs text-neutral-400">
                      {t.price > 0 ? `${formatAmount(t.price)} / month` : "free"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
            <h2 className="label-mono">funding goals</h2>
            {goals.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">No goals set.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {goals.map((g) => (
                  <li key={g.id} className="flex items-center justify-between rounded-lg border border-neutral-800/60 px-3 py-2 text-sm">
                    <span className="truncate">{g.title}</span>
                    <span className="ml-3 shrink-0 font-mono text-xs text-neutral-500">{formatAmount(g.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {!user.isCreator && (
        <section className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/60 p-6 text-center">
          <p className="text-sm text-neutral-400">
            You haven&apos;t enabled donations yet.
          </p>
          <Link href="/onboarding" className="mt-3 inline-block rounded-lg bg-white px-4 py-2 font-mono text-xs font-medium text-black">
            Finish setup →
          </Link>
        </section>
      )}
    </div>
  );
}
