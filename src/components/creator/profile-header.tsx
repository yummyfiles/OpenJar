import Link from "next/link";
import { BadgeCheck, ExternalLink, Github, Globe, MapPin, Youtube, Twitter } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton, BookmarkButton, CreatorViewBeacon } from "@/components/creator/client-actions";
import { formatAmount, cn } from "@/lib/utils";

export type PublicCreator = {
  id: string;
  username: string | null;
  displayName: string | null;
  name: string;
  bio: string | null;
  image: string | null;
  banner: string | null;
  website: string | null;
  github: string | null;
  twitter: string | null;
  youtube: string | null;
  twitch: string | null;
  location: string | null;
  verified: boolean;
  verifiedNote: string | null;
  isCreator: boolean;
  category: string | null;
  tags: string[];
  currency: string;
  monthlyGoal: number | null;
  allowAnonymous: boolean;
  allowMessages: boolean;
  minDonation: number;
  themeMode: string;
  accent: string;
  monoBranding: boolean;
  createdAt: Date;
  customLinks: unknown;
};

export function ProfileHeader({
  creator,
  counts,
  viewerState,
  ownPage
}: {
  creator: PublicCreator;
  counts: { followers: number; following: number; supporters: number };
  viewerState: { following: boolean; bookmarked: boolean };
  ownPage: boolean;
}) {
  const hasSocial =
    creator.website || creator.github || creator.twitter || creator.youtube || creator.twitch;

  return (
    <div>
      <CreatorViewBeacon username={creator.username ?? ""} />

      {/* banner */}
      <div className="relative h-44 w-full overflow-hidden border-b border-neutral-900 sm:h-56">
        {creator.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.banner} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-grid-faint" />
        )}
      </div>

      {/* identity */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex flex-col gap-4 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-5">
            <div className="-mt-16 sm:-mt-20">
              <Avatar src={creator.image} alt={creator.displayName ?? creator.name} size="xl" ring className="bg-black" />
            </div>
            <div className="mt-3 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {creator.displayName || creator.name}
                </h1>
                {creator.verified && (
                  <Badge variant="accent">
                    <BadgeCheck className="h-3 w-3" />
                    verified
                  </Badge>
                )}
                {ownPage && (
                  <Badge>
                    <Link href="/dashboard/settings">edit profile</Link>
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 font-mono text-sm text-neutral-500">@{creator.username}</p>

              {creator.bio && <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">{creator.bio}</p>}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500">
                {creator.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {creator.location}
                  </span>
                )}
                {creator.website && (
                  <a href={creator.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <Globe className="h-3 w-3" /> {creator.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {creator.github && (
                  <a href={`https://github.com/${creator.github}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <Github className="h-3 w-3" /> @{creator.github}
                  </a>
                )}
                {creator.twitter && (
                  <a href={`https://twitter.com/${creator.twitter.replace(/^@/, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <Twitter className="h-3 w-3" /> {creator.twitter}
                  </a>
                )}
                {creator.youtube && (
                  <a href={creator.youtube} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">
                    <Youtube className="h-3 w-3" /> YouTube
                  </a>
                )}
                {!hasSocial && !creator.location && <span className="text-neutral-600">No links yet</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:flex-col sm:items-end">
            <div className="flex items-center gap-2">
              <FollowButton username={creator.username ?? ""} initialFollowing={viewerState.following} />
              <BookmarkButton username={creator.username ?? ""} initialBookmarked={viewerState.bookmarked} />
            </div>
            <div className="mt-1 flex items-center gap-4 font-mono text-xs text-neutral-500">
              <span>
                <strong className="text-white">{counts.followers}</strong> followers
              </span>
              <span>
                <strong className="text-white">{counts.supporters}</strong> supporters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// a tiny "X raised so far" pill used on cards
export function RaisedPill({ amount, currency }: { amount: number; currency?: string }) {
  if (!amount) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-0.5 font-mono text-[11px] text-neutral-400">
      <ExternalLink className="h-3 w-3" />
      {formatAmount(amount, currency)} raised
    </span>
  );
}

export { cn };
