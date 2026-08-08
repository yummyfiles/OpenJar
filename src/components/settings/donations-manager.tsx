"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { formatAmount, timeAgo } from "@/lib/utils";

type Donation = {
  id: string;
  amount: number;
  currency: string;
  message: string | null;
  anonymous: boolean;
  status: string;
  createdAt: string;
  supporterName: string | null;
};

export default function DonationsManager() {
  const [donations, setDonations] = React.useState<Donation[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/v1/me/dashboard")
      .then((r) => r.json())
      .then((json) => setDonations(json.data?.recentDonations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
      <h2 className="label-mono">recent donations</h2>
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
        </div>
      ) : donations.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-500">No donations yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-800/60">
          {donations.map((d) => (
            <li key={d.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {d.anonymous ? "Anonymous" : (d.supporterName || "Guest")}
                </p>
                {d.message && <p className="mt-0.5 truncate text-xs text-neutral-500">{d.message}</p>}
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(d.createdAt)} · {d.status}</p>
              </div>
              <span className="shrink-0 font-mono text-sm">+{formatAmount(d.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
