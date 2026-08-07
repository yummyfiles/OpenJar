"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

type Request = {
  id: string;
  status: string;
  evidence: string | null;
  note: string | null;
  createdAt: string;
  user: { id: string; username: string | null; displayName: string | null; name: string; email: string; image: string | null; verified: boolean; website: string | null; github: string | null };
};

export default function AdminVerifications() {
  const [requests, setRequests] = React.useState<Request[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/admin/verifications")
      .then((r) => r.json())
      .then((json) => setRequests(json.data ?? []))
      .catch(() => setRequests([]));
  }, []);

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/admin/verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success(approve ? "Approved" : "Declined");
      setRequests((r) => r?.filter((x) => x.id !== id) ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!requests) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
        No pending verification requests.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {requests.map((r) => (
        <li key={r.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex items-center gap-3">
            <Avatar src={r.user.image} alt={r.user.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{r.user.displayName || r.user.name}</p>
              <p className="truncate font-mono text-[10px] uppercase tracking-wider text-neutral-600">
                @{r.user.username} · {r.user.email} · requested {timeAgo(r.createdAt)}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              <Button size="sm" variant="outline" className="text-emerald-400" disabled={busyId === r.id} onClick={() => decide(r.id, true)}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-400" disabled={busyId === r.id} onClick={() => decide(r.id, false)}>
                <X className="h-3.5 w-3.5" /> Decline
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 font-mono text-xs text-neutral-500">
            {r.user.website && <span>site: {r.user.website}</span>}
            {r.user.github && <span>github: @{r.user.github}</span>}
          </div>
          {(r.evidence || r.note) && (
            <p className="mt-2 whitespace-pre-wrap rounded-lg border border-neutral-800/60 bg-neutral-900/50 p-3 text-sm text-neutral-400">
              {r.evidence || r.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
