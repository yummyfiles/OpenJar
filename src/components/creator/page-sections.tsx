"use client";

import * as React from "react";
import { Link2 } from "lucide-react";
import type { PageLink, PageSectionId } from "@/lib/page-layout";
import { GoalList, type PublicGoal } from "@/components/creator/creator-goals";
import { PostListView, type PublicPost } from "@/components/creator/creator-posts";
import { ProjectGrid, type PublicProject } from "@/components/creator/creator-projects";
import { RecentSupporters, type PublicDonation } from "@/components/creator/supporters";
import {
  GithubSection,
  type GithubRepo,
  type GithubContribution
} from "@/components/creator/github-section";

export type SupportTier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  perks: string[];
};

// everything a creator page needs to render, flattened into JSON-safe
// values so it can cross the server/client boundary (dates as ISO strings).
export type PageSnapshot = {
  username: string;
  githubUsername: string | null;
  image: string | null;
  banner: string | null;
  minDonation: number;
  allowAnonymous: boolean;
  allowMessages: boolean;
  tiers: SupportTier[];
  goals: PublicGoal[];
  posts: PublicPost[];
  projects: PublicProject[];
  github: { repos: GithubRepo[]; contributions: GithubContribution | null };
  summary: { monthlyRaised: number; totalRaised: number; recentSupporters: PublicDonation[] };
  links: PageLink[];
};

export function StatGrid({ monthly, total }: { monthly: number; total: number }) {
  if (monthly <= 0 && total <= 0) return null;
  return (
    <section className="grid grid-cols-2 gap-4">
      <Stat label="raised this month" value={monthly} />
      <Stat label="raised all time" value={total} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="oj-card rounded-xl border border-neutral-800 p-4">
      <p className="label-mono">{label}</p>
      <p className="oj-page-text mt-1 font-mono text-2xl">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0
        }).format(value / 100)}
      </p>
    </div>
  );
}

export function CustomLinks({ links }: { links: PageLink[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="oj-card oj-btn oj-btn-text inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors hover:border-neutral-600 hover:text-white"
        >
          <Link2 className="h-3.5 w-3.5 text-neutral-500" />
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function SectionRenderer({
  section,
  snapshot,
  editable = false
}: {
  section: PageSectionId;
  snapshot: PageSnapshot;
  editable?: boolean;
}) {
  let content: React.ReactNode = null;

  switch (section) {
    case "stats":
      content = <StatGrid monthly={snapshot.summary.monthlyRaised} total={snapshot.summary.totalRaised} />;
      break;
    case "links":
      content = <CustomLinks links={snapshot.links} />;
      break;
    case "goals":
      content = <GoalList goals={snapshot.goals} />;
      break;
    case "posts":
      content = <PostListView posts={snapshot.posts} username={snapshot.username} />;
      break;
    case "projects":
      content = <ProjectGrid projects={snapshot.projects} />;
      break;
    case "github":
      content = (
        <GithubSection
          username={snapshot.githubUsername ?? snapshot.username}
          repos={snapshot.github.repos}
          contributions={snapshot.github.contributions}
          totalContributions={snapshot.github.contributions?.total ?? null}
        />
      );
      break;
    case "supporters":
      content = <RecentSupporters donations={snapshot.summary.recentSupporters} />;
      break;
  }

  if (!content) {
    if (editable) {
      return (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-neutral-700 bg-neutral-950/30 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-600">
            empty section — nothing to show here yet
          </p>
        </div>
      );
    }
    return null;
  }

  return content;
}

// read-only main column (used when the page is just being viewed)
export function CreatorPageContent({ snapshot, order }: { snapshot: PageSnapshot; order: PageSectionId[] }) {
  return (
    <div className="min-w-0 space-y-12">
      {order.map((id) => (
        <SectionRenderer key={id} section={id} snapshot={snapshot} />
      ))}
    </div>
  );
}
