import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { CSSProperties } from "react";
import { auth } from "@/lib/auth";
import { getCreatorPageData } from "@/server/services/creators";
import { ProfileHeader, type PublicCreator } from "@/components/creator/profile-header";
import { SupportPanel } from "@/components/creator/support-panel";
import { RecentSupporters } from "@/components/creator/supporters";
import { Separator } from "@/components/ui/separator";
import { PageBuilder } from "@/components/creator/page-builder";
import { CreatorPageContent, type PageSnapshot } from "@/components/creator/page-sections";
import { isHexColor, parseLayout } from "@/lib/page-layout";
import type { PageLayout } from "@/lib/page-layout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// guard the reserved word pages before hitting the username catch-all
const reserved = new Set([
  "about", "admin", "api", "auth", "dashboard", "discover", "docs", "faq", "forgot-password",
  "guidelines", "login", "onboarding", "privacy", "reset-password", "signup", "terms", "open-source", "contact"
]);

type PageData = NonNullable<Awaited<ReturnType<typeof getCreatorPageData>>>;

export default async function CreatorPage({
  params,
  searchParams
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ customize?: string }>;
}) {
  const { username } = await params;
  if (reserved.has(username)) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerId = session?.user?.id ?? null;

  const data = await getCreatorPageData(username, viewerId);
  if (!data) notFound();

  const user = data.user as PublicCreator;
  const ownPage = viewerId === user.id;
  const { customize } = await searchParams;
  const customizeMode = ownPage && customize === "1";

  const layout = parseLayout(user.customLinks);
  const snapshot = toSnapshot(data, layout);

  const cssVars: Record<string, string> = {};
  const { colors } = layout.layout;
  if (colors.pageBg) cssVars.backgroundColor = colors.pageBg;
  if (colors.card) cssVars["--oj-card"] = colors.card;
  if (colors.text) cssVars["--oj-text"] = colors.text;
  const accent = colors.accent ?? (isHexColor(user.accent) ? user.accent : undefined);
  if (accent) cssVars["--oj-accent"] = accent;

  return (
    <main>
      <ProfileHeader creator={user} counts={data.counts} viewerState={data.viewerState} ownPage={ownPage} />

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6" style={cssVars as CSSProperties}>
        {customizeMode ? (
          <PageBuilder snapshot={snapshot} initialLayout={layout} username={username} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <CreatorPageContent snapshot={snapshot} order={layout.layout.sections} />

            {/* sidebar */}
            <aside className="space-y-8">
              <div className="lg:sticky lg:top-20">
                <SupportPanel
                  username={username}
                  tiers={snapshot.tiers}
                  minDonation={snapshot.minDonation}
                  allowAnonymous={snapshot.allowAnonymous}
                  allowMessages={snapshot.allowMessages}
                />
                <Separator className="my-6" />
                <RecentSupporters donations={snapshot.summary.recentSupporters} />
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

// flatten every date to an ISO string so the snapshot is safe to pass into
// client components (the section components now type their dates as strings)
function toSnapshot(data: PageData, layout: PageLayout): PageSnapshot {
  return {
    username: data.user.username ?? "",
    githubUsername: data.user.github,
    image: data.user.image,
    banner: data.user.banner,
    minDonation: data.user.minDonation,
    allowAnonymous: data.user.allowAnonymous,
    allowMessages: data.user.allowMessages,
    tiers: data.tiers.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      price: t.price,
      currency: t.currency,
      perks: Array.isArray(t.perks) ? t.perks : []
    })),
    goals: data.goals.map((g) => ({
      ...g,
      deadline: g.deadline ? g.deadline.toISOString() : null,
      completedAt: g.completedAt ? g.completedAt.toISOString() : null,
      createdAt: g.createdAt.toISOString()
    })),
    posts: data.posts.map((p) => ({
      ...p,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      createdAt: p.createdAt.toISOString()
    })),
    projects: data.projects.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() })),
    github: { repos: data.github.repos, contributions: data.github.contributions },
    summary: {
      ...data.summary,
      recentSupporters: data.summary.recentSupporters.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))
    },
    links: layout.links
  };
}
