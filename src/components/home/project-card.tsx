import Link from "next/link";
import { GitFork, Heart } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { compactNumber } from "@/lib/utils";

export function ProjectCard({
  project
}: {
  project: {
    id: string;
    name: string;
    description: string | null;
    tags: string[];
    repoUrl: string | null;
    likes: number;
    pinned?: boolean;
    creator: {
      id: string;
      username: string | null;
      displayName: string | null;
      name: string;
      image: string | null;
      verified: boolean;
    };
  };
}) {
  const handle = project.creator.username ?? project.creator.id;

  return (
    <Link
      href={`/${handle}`}
      className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-all hover:-translate-y-1 hover:border-neutral-600 hover:shadow-card-hover"
    >
      <div className="flex items-center gap-3">
        <Avatar src={project.creator.image} alt={project.creator.displayName ?? project.creator.name} size="sm" />
        <div className="min-w-0">
          <h3 className="truncate font-semibold tracking-tight group-hover:text-white">{project.name}</h3>
          <p className="truncate font-mono text-xs text-neutral-500">by @{handle}</p>
        </div>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-neutral-500">
        {project.description ?? "A project worth supporting."}
      </p>

      {project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-neutral-800 pt-3 text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-3.5 w-3.5" /> {compactNumber(project.likes)}
        </span>
        <span className="inline-flex items-center gap-3">
          {project.repoUrl && (
            <span className="inline-flex items-center gap-1 font-mono">
              <GitFork className="h-3.5 w-3.5" /> repo
            </span>
          )}
        </span>
      </div>
    </Link>
  );
}
