"use client";

import * as React from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatorCard } from "@/components/home/creator-card";
import { ProjectCard } from "@/components/home/project-card";
import { CREATOR_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Tab = "creators" | "projects";
type Sort = "trending" | "newest" | "featured";

type Creator = {
  id: string;
  username: string | null;
  displayName: string | null;
  name: string;
  bio: string | null;
  image: string | null;
  verified: boolean;
  category: string | null;
  raised?: number;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  repoUrl: string | null;
  likes: number;
  creator: { id: string; username: string | null; displayName: string | null; name: string; image: string | null; verified: boolean };
};

const PAGE_SIZE = 18;

export default function DiscoverPage() {
  const [tab, setTab] = React.useState<Tab>(() => {
    if (typeof window === "undefined") return "creators";
    const t = new URLSearchParams(window.location.search).get("tab");
    return t === "projects" ? "projects" : "creators";
  });
  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [category, setCategory] = React.useState(() =>
    typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("category") ?? "" : ""
  );
  const [sort, setSort] = React.useState<Sort>(() => {
    if (typeof window === "undefined") return "trending";
    const s = new URLSearchParams(window.location.search).get("sort");
    return s === "newest" || s === "featured" ? s : "trending";
  });
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [creators, setCreators] = React.useState<Creator[]>([]);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  React.useEffect(() => {
    setPage(1);
  }, [tab, debouncedQ, category, sort]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      sort,
      page: String(page),
      perPage: String(PAGE_SIZE)
    });
    if (debouncedQ) params.set("q", debouncedQ);
    if (category) params.set("category", category);

    fetch(`/api/v1/discover/${tab}?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (tab === "creators") {
          setCreators(json.data.creators ?? []);
          setTotalPages(json.data.totalPages ?? 1);
        } else {
          setProjects(json.data.projects ?? []);
          setTotalPages(json.data.totalPages ?? 1);
        }
        setLoading(false);
      })
      .catch(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tab, debouncedQ, category, sort, page]);

  const grid = tab === "creators" ? creators.map((c) => <CreatorCard key={c.id} creator={c} raised={c.raised} />) : projects.map((p) => <ProjectCard key={p.id} project={p} />);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <header className="text-center">
        <p className="label-mono mb-2">explore</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find your next favorite maker</h1>
        <p className="mt-2 text-sm text-neutral-500">Independent developers, artists, and creators doing great work.</p>
      </header>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search creators and projects…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-300 outline-none focus:border-neutral-600"
          >
            <option value="">All categories</option>
            {CREATOR_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setQ("");
              setCategory("");
              setSort("trending");
            }}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
        {(["creators", "projects"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
              tab === t ? "bg-white text-black" : "text-neutral-400 hover:text-white"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1">
        {(["trending", "newest", "featured"] as Sort[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
              sort === s ? "bg-neutral-900 text-white" : "text-neutral-500 hover:text-white"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
        </div>
      ) : grid.length === 0 ? (
        <p className="mt-16 text-center text-sm text-neutral-500">Nothing found. Try different filters.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{grid}</div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <span className="font-mono text-xs text-neutral-500">
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
