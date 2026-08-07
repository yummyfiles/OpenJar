"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { id: string; username: string | null; displayName: string | null; image: string | null } | null;
};

const STATUSES = ["open", "investigating", "resolved", "dismissed"] as const;

export default function AdminReports() {
  const [reports, setReports] = React.useState<Report[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/admin/reports")
      .then((r) => r.json())
      .then((json) => setReports(json.data ?? []))
      .catch(() => setReports([]));
  }, []);

  async function update(id: string, status: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/v1/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success(`Report ${status}`);
      setReports((r) => r?.map((x) => (x.id === id ? { ...x, status } : x)) ?? []);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!reports) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
        No reports. All clear.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {reports.map((r) => (
        <li key={r.id} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Avatar src={r.reporter?.image ?? null} alt={r.reporter?.displayName ?? "?"} size="sm" />
            <span className="font-medium">{r.reporter?.displayName ?? "Unknown"}</span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              reported {timeAgo(r.createdAt)}
            </span>
            <span className="ml-auto rounded-full bg-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">{r.status}</span>
          </div>
          <p className="mt-2 text-sm text-neutral-400">
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">{r.targetType} · </span>
            <span className="font-mono text-xs">{r.targetId}</span>
          </p>
          <p className="mt-1 text-sm text-white">{r.reason}</p>
          {r.details && <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-500">{r.details}</p>}
          <div className="mt-3 flex gap-1.5">
            {STATUSES.filter((s) => s !== r.status).map((s) => (
              <Button key={s} variant="outline" size="sm" disabled={busyId === r.id} onClick={() => update(r.id, s)}>
                {s}
              </Button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}
