import Link from "next/link";
import { Github, Heart } from "lucide-react";
import { compactNumber, formatDate } from "@/lib/utils";

export type PublicProject = {
  id: string;
  name: string;
  description: string | null;
  repoUrl: string | null;
  website: string | null;
  tags: string[];
  pinned: boolean;
  likes: number;
  createdAt: Date;
};

export function ProjectGrid({ projects }: { projects: PublicProject[] }) {
  if (projects.length === 0) return null;
  return (
    <section>
      <h2 className="label-mono mb-4">Projects</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-all hover:-translate-y-1 hover:border-neutral-600">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold tracking-tight">{project.name}</h3>
              <span className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500">
                <Heart className="h-3.5 w-3.5" /> {compactNumber(project.likes)}
              </span>
            </div>
            {project.description && (
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-neutral-500">{project.description}</p>
            )}
            {project.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {(project.repoUrl || project.website) && (
              <div className="mt-4 flex items-center gap-4 border-t border-neutral-900 pt-3 text-xs">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-neutral-400 hover:text-white">
                    <Github className="h-3.5 w-3.5" /> repo
                  </a>
                )}
                {project.website && (
                  <Link href={project.website} target="_blank" className="text-neutral-400 hover:text-white">
                    website
                  </Link>
                )}
                <span className="ml-auto font-mono text-[11px] text-neutral-600">{formatDate(project.createdAt)}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
