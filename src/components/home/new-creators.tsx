import { CreatorCard } from "./creator-card";
import { Section } from "./section";
import { SectionHeader } from "./featured";

export function NewCreators({
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
      <SectionHeader eyebrow="new this week" title="Fresh pages, new voices" href="/discover?sort=newest" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator) => (
          <CreatorCard key={creator.id} creator={creator} raised={creator.raised} followers={creator.followers} />
        ))}
      </div>
    </Section>
  );
}
