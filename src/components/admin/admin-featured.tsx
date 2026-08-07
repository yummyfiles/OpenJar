"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";

type Featured = {
  id: string;
  label: string;
  slot: number;
  creator: { id: string; username: string | null; displayName: string | null; name: string; image: string | null; verified: boolean } | null;
};

export default function AdminFeatured() {
  const [items, setItems] = React.useState<Featured[] | null>(null);
  const [creatorId, setCreatorId] = React.useState("");
  const [label, setLabel] = React.useState("featured");
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/v1/admin/featured")
      .then((r) => r.json())
      .then((json) => setItems(json.data ?? []))
      .catch(() => setItems([]));
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!creatorId) return;
    setAdding(true);
    try {
      const res = await fetch("/api/v1/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId, label })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Featured creator added");
      setCreatorId("");
      const refetch = await fetch("/api/v1/admin/featured").then((r) => r.json());
      setItems(refetch.data ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setAdding(false);
    }
  }

  async function remove(item: Featured) {
    setBusyId(item.id);
    try {
      const res = await fetch("/api/v1/admin/featured", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: item.creator?.id ?? item.id, label: item.label })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Removed");
      setItems((r) => r?.filter((x) => x.id !== item.id) ?? []);
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
          <Star className="h-3.5 w-3.5" /> Add featured
        </h2>
        <div className="mt-4">
          <Label htmlFor="creatorId">Creator user ID</Label>
          <Input id="creatorId" value={creatorId} onChange={(e) => setCreatorId(e.target.value)} placeholder="usr_…" className="mt-2 font-mono" />
        </div>
        <div className="mt-3">
          <Label htmlFor="label">Label</Label>
          <select id="label" value={label} onChange={(e) => setLabel(e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-300 outline-none focus:border-neutral-600">
            <option value="featured">featured</option>
            <option value="open-source">open-source</option>
            <option value="new">new</option>
          </select>
        </div>
        <Button type="submit" className="mt-4 w-full" disabled={adding || !creatorId}>
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Add"}
        </Button>
      </form>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="label-mono">currently featured</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">Nothing featured yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-neutral-800/60">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <Avatar src={item.creator?.image ?? null} alt={item.creator?.name ?? "?"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.creator?.displayName ?? item.creator?.name ?? "Unknown"}</p>
                  <p className="truncate font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                    @{item.creator?.username} · slot {item.slot} · {item.label}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-red-400" disabled={busyId === item.id} onClick={() => remove(item)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
