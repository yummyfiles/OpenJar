"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { formatAmount } from "@/lib/utils";

type Stats = {
  users: number;
  creators: number;
  donations: number;
  revenue: number;
  monthlyRevenue: number;
  reports: number;
  pendingVerifications: number;
};

export default function AdminOverview() {
  const [stats, setStats] = React.useState<Stats | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/admin/stats")
      .then((r) => r.json())
      .then((json) => setStats(json.data))
      .catch(() => {});
  }, []);

  if (!stats) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  const cards = [
    { label: "users", value: String(stats.users) },
    { label: "creators", value: String(stats.creators) },
    { label: "donations", value: String(stats.donations) },
    { label: "all-time revenue", value: formatAmount(stats.revenue) },
    { label: "revenue this month", value: formatAmount(stats.monthlyRevenue) },
    { label: "open reports", value: String(stats.reports), alert: stats.reports > 0 },
    { label: "pending verifications", value: String(stats.pendingVerifications), alert: stats.pendingVerifications > 0 }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-xl border p-5 ${c.alert ? "border-amber-500/40 bg-amber-500/5" : "border-neutral-800 bg-neutral-950/60"}`}>
          <p className="label-mono">{c.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{c.value}</p>
        </div>
      ))}
    </div>
  );
}
