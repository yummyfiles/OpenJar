import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCreatorPageData } from "@/server/services/creators";
import { ProfileHeader, type PublicCreator } from "@/components/creator/profile-header";
import { SupportPanel } from "@/components/creator/support-panel";
import { PostListView, type PublicPost } from "@/components/creator/creator-posts";
import { ProjectGrid, type PublicProject } from "@/components/creator/creator-projects";
import { GoalList, type PublicGoal } from "@/components/creator/creator-goals";
import { RecentSupporters, type PublicDonation } from "@/components/creator/supporters";
import { GithubSection } from "@/components/creator/github-section";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// guard the reserved word pages before hitting the username catch-all
const reserved = new Set([
  "about", "admin", "api", "auth", "dashboard", "discover", "docs", "faq", "forgot-password",
  "guidelines", "login", "onboarding", "privacy", "reset-password", "signup", "terms", "open-source", "contact"
]);

export default async function CreatorPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  if (reserved.has(username)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerId = session?.user?.id ?? null;

  const data = await getCreatorPageData(username, viewerId);
  if (!data) notFound();

  const user = data.user as PublicCreator;
  const ownPage = viewerId === user.id;

  const tiers = data.tiers.map((t) => ({
    ...t,
    perks: Array.isArray(t.perks) ? t.perks : []
  }));

  return (
    <main>
      <ProfileHeader creator={user} counts={data.counts} viewerState={data.viewerState} ownPage={ownPage} />

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* main column */}
          <div className="min-w-0 space-y-12">
            {(data.summary.monthlyRaised > 0 || data.summary.totalRaised > 0) && (
              <section className="grid grid-cols-2 gap-4">
                <Stat label="raised this month" value={data.summary.monthlyRaised} />
                <Stat label="raised all time" value={data.summary.totalRaised} />
              </section>
            )}

            <GoalList goals={data.goals as unknown as PublicGoal[]} />

            <PostListView posts={data.posts as unknown as PublicPost[]} username={username} />

            <ProjectGrid projects={data.projects as unknown as PublicProject[]} />

            <GithubSection
              username={user.github ?? username}
              repos={data.github.repos}
              contributions={data.github.contributions}
              totalContributions={data.github.contributions?.total ?? null}
            />
          </div>

          {/* sidebar */}
          <aside className="space-y-8">
            <div className="lg:sticky lg:top-20">
              <SupportPanel
                username={username}
                tiers={tiers}
                minDonation={user.minDonation}
                allowAnonymous={user.allowAnonymous}
                allowMessages={user.allowMessages}
              />
              <Separator className="my-6" />
              <RecentSupporters donations={data.summary.recentSupporters as unknown as PublicDonation[]} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
      <p className="label-mono">{label}</p>
      <p className="mt-1 font-mono text-2xl text-white">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(value / 100)}
      </p>
    </div>
  );
}
