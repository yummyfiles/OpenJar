import { ProjectCard } from "./project-card";
import { Section } from "./section";
import { SectionHeader } from "./featured";

export function TrendingProjects({
  projects
}: {
  projects: {
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    repoUrl: string | null;
    likes: number;
    creator: { id: string; username: string | null; displayName: string | null; name: string; image: string | null; verified: boolean };
  }[];
}) {
  return (
    <Section className="border-t border-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="trending" title="Projects people are funding" href="/discover?tab=projects" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </Section>
  );
}
