import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CreatorCard } from "./creator-card";
import { Section } from "./section";

export function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel = "View all"
}: {
  eyebrow: string;
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <div>
        <p className="label-mono mb-2">{eyebrow}</p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <Link
        href={href}
        className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-neutral-500 transition-colors hover:text-white"
      >
        {linkLabel} <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

export function FeaturedCreators({
  creators
}: {
  creators: {
    id: string;
    username: string | null;
    displayName: string | null;
    name: string;
    bio: string | null;
    image: string | null;
    verified: boolean;
    category: string | null;
    raised: number;
    followers: number;
  }[];
}) {
  return (
    <Section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeader eyebrow="featured" title="Creators worth following" href="/discover" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} raised={creator.raised} followers={creator.followers} />
        ))}
      </div>
    </Section>
  );
}
