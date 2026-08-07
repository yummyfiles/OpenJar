"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Megaphone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { timeAgo } from "@/lib/utils";

type Announcement = { id: string; title: string; content: string; createdAt: string; updatedAt: string };

export default function AdminAnnouncements() {
  const [items, setItems] = React.useState<Announcement[] | null>(null);
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/admin/announcements")
      .then((r) => r.json())
      .then((json) => setItems(json.data ?? []))
      .catch(() => setItems([]));
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/v1/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Announcement published");
      setTitle("");
      setContent("");
      setItems((r) => [json.data, ...(r ?? [])]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/admin/announcements/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Announcement deleted");
      setItems((r) => r?.filter((x) => x.id !== id) ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!items) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={add} className="h-fit rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="label-mono flex items-center gap-2">
          <Megaphone className="h-3.5 w-3.5" /> New announcement
        </h2>
        <div className="mt-4">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" maxLength={120} />
        </div>
        <div className="mt-3">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="mt-2 h-32 resize-none" maxLength={4000} />
        </div>
        <Button type="submit" className="mt-4 w-full" disabled={adding}>
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publish"}
        </Button>
      </form>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="label-mono">past announcements</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No announcements yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-800/60">
            {items.map((a) => (
              <li key={a.id} className="py-3">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(a.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-red-400" disabled={busyId === a.id} onClick={() => remove(a.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-neutral-500">{a.content}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
