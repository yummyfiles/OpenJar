"use client";

import * as React from "react";
import { toast } from "sonner";
import { Search, Loader2, ShieldCheck, ShieldBan, BadgeCheck, ShieldOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

type AdminUser = {
  id: string;
  username: string | null;
  displayName: string | null;
  name: string;
  email: string;
  image: string | null;
  role: string;
  verified: boolean;
  banned: boolean;
  isCreator: boolean;
  createdAt: string;
};

export default function AdminUsers() {
  const [users, setUsers] = React.useState<AdminUser[] | null>(null);
  const [q, setQ] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    fetch(`/api/v1/admin/users?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => setUsers(json.data?.users ?? []))
      .catch(() => setUsers([]));
  }, [q]);

  async function action(id: string, body: Record<string, unknown>, okMessage: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success(okMessage);
      const refetch = await fetch("/api/v1/admin/users").then((r) => r.json());
      setUsers(refetch.data?.users ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username, email, or name…" className="pl-9" />
      </div>

      {!users ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {users.length === 0 && <li className="p-8 text-center text-sm text-neutral-500">No users found.</li>}
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 p-4">
              <Avatar src={u.image} alt={u.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {u.displayName || u.name}
                  {u.verified && <BadgeCheck className="ml-1.5 inline h-3.5 w-3.5 text-white" />}
                  {u.banned && <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-red-400">banned</span>}
                  <span className="ml-2 rounded-full bg-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase text-neutral-400">{u.role}</span>
                  {u.isCreator && <span className="ml-1 rounded-full bg-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase text-neutral-400">creator</span>}
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                  @{u.username} · {u.email} · joined {timeAgo(u.createdAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {u.role !== "admin" && (
                  <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-white" disabled={busyId === u.id} onClick={() => action(u.id, { action: "role", role: "moderator" }, "Made moderator")} title="Make moderator">
                    <ShieldCheck className="h-4 w-4" />
                  </Button>
                )}
                {!u.verified && (
                  <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-white" disabled={busyId === u.id} onClick={() => action(u.id, { action: "verify" }, "User verified")} title="Verify">
                    <BadgeCheck className="h-4 w-4" />
                  </Button>
                )}
                {u.banned ? (
                  <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-emerald-400" disabled={busyId === u.id} onClick={() => action(u.id, { action: "unban" }, "User unbanned")} title="Unban">
                    <ShieldOff className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" className="p-2 text-neutral-400 hover:text-red-400" disabled={busyId === u.id} onClick={() => action(u.id, { action: "ban" }, "User banned")} title="Ban">
                    <ShieldBan className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
