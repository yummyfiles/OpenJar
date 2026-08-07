import Link from "next/link";
import { GitFork, Github, Star } from "lucide-react";
import { compactNumber } from "@/lib/utils";

type Repo = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  forks: number;
  pinned: boolean;
};

type Contribution = { weeks: unknown; total: number };

export function GithubSection({
  username,
  repos,
  contributions,
  totalContributions
}: {
  username: string;
  repos: Repo[];
  contributions: Contribution | null;
  totalContributions: number | null;
}) {
  if (repos.length === 0 && !contributions) return null;

  return (
    <section>
      <h2 className="label-mono mb-4 flex items-center gap-2">
        <Github className="h-3.5 w-3.5" /> GitHub
      </h2>

      {contributions && totalContributions != null && (
        <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-sm text-neutral-400">contributions</span>
            <span className="font-mono text-xl text-white">{compactNumber(totalContributions)}</span>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {repos.slice(0, 8).map((repo) => (
          <a
            key={repo.id}
            href={repo.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 transition-colors hover:border-neutral-600"
          >
            <div className="flex items-center justify-between gap-2">
              <h3 className="truncate font-mono text-sm group-hover:text-white">{repo.name}</h3>
              {repo.language && (
                <span className="shrink-0 rounded border border-neutral-800 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  {repo.language}
                </span>
              )}
            </div>
            {repo.description && <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-neutral-500">{repo.description}</p>}
            <div className="mt-3 flex items-center gap-4 font-mono text-[11px] text-neutral-500">
              <span className="inline-flex items-center gap-1">
                <Star className="h-3 w-3" /> {compactNumber(repo.stars)}
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3 w-3" /> {compactNumber(repo.forks)}
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
        <Link href={`https://github.com/${username}`} target="_blank" className="hover:text-neutral-300">
          view all on github →
        </Link>
      </p>
    </section>
  );
}
