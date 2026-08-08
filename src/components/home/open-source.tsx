import Link from "next/link";
import { Github } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Section } from "./section";
import { SectionHeader } from "./featured";

export function OpenSourceSpotlight({
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
    github: string | null;
    raised: number;
    followers: number;
  }[];
}) {
  return (
    <Section className="bg-neutral-950/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="open-source spotlight" title="Builders keeping the web open" href="/discover?category=open-source" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((creator) => {
            const handle = creator.username ?? creator.id;
            return (
              <Link
                key={creator.id}
                href={`/${handle}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-3">
                  <Avatar src={creator.image} alt={creator.displayName ?? creator.name} size="lg" />
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold tracking-tight">
                      {creator.displayName ?? creator.name}
                      <span className="ml-2 font-mono text-xs font-normal text-neutral-500">@{handle}</span>
                    </h3>
                    {creator.github && (
                      <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-neutral-500">
                        <Github className="h-3 w-3" /> {creator.github}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-500">
                  {creator.bio ?? "Open-source developer."}
                </p>
                <div className="mt-4 border-t border-neutral-800 pt-3 font-mono text-xs text-neutral-500">
                  {creator.raised >= 1000 ? `${(creator.raised / 100).toLocaleString()} raised` : `${creator.followers} followers`}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
