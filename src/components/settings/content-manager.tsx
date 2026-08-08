"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

type OwnedContent = {
  tiers: { id: string; name: string; price: number; currency: string; period: string; sortOrder: number }[];
  goals: { id: string; title: string; target: number; currency: string; createdAt: string }[];
  projects: { id: string; name: string; description: string | null; createdAt: string }[];
  posts: { id: string; title: string; slug: string; status: string; publishedAt: string | null; createdAt: string; updatedAt: string; _count: { likes: number; comments: number } }[];
};

type Tab = "posts" | "goals" | "tiers" | "projects";

export default function ContentManager() {
  const router = useRouter();
  const [data, setData] = React.useState<OwnedContent | null>(null);
  const [tab, setTab] = React.useState<Tab>("posts");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/dashboard/content")
      .then((r) => r.json())
      .then((json) => setData(json.data))
      .catch(() => setData(null));
  }, []);

  async function deletePost(id: string) {
    if (!confirm("Delete this post? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/posts/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Post deleted");
      setData((d) => (d ? { ...d, posts: d.posts.filter((p) => p.id !== id) } : d));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  const tabs: Tab[] = ["posts", "goals", "tiers", "projects"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                tab === t ? "bg-white text-black" : "text-neutral-400 hover:text-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "posts" && (
          <Link
            href="/settings/content/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 font-mono text-xs font-medium text-black"
          >
            <Plus className="h-3.5 w-3.5" /> New post
          </Link>
        )}
      </div>

      {tab === "posts" && (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {data.posts.length === 0 && (
            <li className="p-8 text-center text-sm text-neutral-500">No posts yet.</li>
          )}
          {data.posts.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <Badge variant={p.status === "published" ? "accent" : "default"}>{p.status}</Badge>
                </div>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                  {p.status === "published" && p.publishedAt ? timeAgo(p.publishedAt) : `updated ${timeAgo(p.updatedAt)}`} · {p._count.likes} likes · {p._count.comments} comments
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`/settings/content/${p.id}`}
                  className="rounded-lg border border-neutral-800 p-2 text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
                <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-red-400" onClick={() => deletePost(p.id)} disabled={busyId === p.id}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "goals" && (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {data.goals.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">No goals yet.</li>}
          {data.goals.map((g) => (
            <li key={g.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium">{g.title}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-600">{g.currency}</p>
              </div>
              <span className="font-mono text-sm text-neutral-400">{g.target}</span>
            </li>
          ))}
        </ul>
      )}

      {tab === "tiers" && (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {data.tiers.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">No tiers yet.</li>}
          {data.tiers.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm font-medium">{t.name}</p>
              <span className="font-mono text-sm text-neutral-400">
                {t.price > 0 ? `${t.price} ${t.currency} / ${t.period}` : "free"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === "projects" && (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {data.projects.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">No projects yet.</li>}
          {data.projects.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{p.name}</p>
                {p.description && <p className="mt-0.5 truncate text-xs text-neutral-500">{p.description}</p>}
              </div>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(p.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
