import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatAmountShort } from "@/lib/utils";

// reusable creator card used on the homepage + discovery
export function CreatorCard({
  creator,
  raised,
  followers
}: {
  creator: {
    id: string;
    username: string | null;
    displayName: string | null;
    name: string;
    bio: string | null;
    image: string | null;
    verified: boolean;
    category: string | null;
  };
  raised?: number;
  followers?: number;
}) {
  const handle = creator.username ?? creator.id;
  return (
    <Link
      href={`/${handle}`}
      className="group relative flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-all hover:border-neutral-600 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between">
        <Avatar src={creator.image} alt={creator.displayName ?? creator.name} size="lg" />
        {creator.verified && (
          <Badge variant="accent" className="gap-1">
            <Star className="h-3 w-3 fill-current" /> verified
          </Badge>
        )}
      </div>

      <h3 className="mt-4 font-semibold tracking-tight group-hover:text-white">
        {creator.displayName ?? creator.name}
        <span className="ml-2 font-mono text-xs font-normal text-neutral-500">@{handle}</span>
      </h3>

      <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
        {creator.bio ?? "Independent creator on OpenJar."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 text-xs text-neutral-500">
        {raised !== undefined ? (
          <span className="font-mono">{formatAmountShort(raised)} raised</span>
        ) : (
          <span className="font-mono">{followers ?? 0} followers</span>
        )}
        <span className="inline-flex items-center gap-1 text-neutral-400 transition-colors group-hover:text-white">
          Support <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
