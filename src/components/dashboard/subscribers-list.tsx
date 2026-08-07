"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatAmount, timeAgo } from "@/lib/utils";

type Sub = {
  id: string;
  status: string;
  createdAt: string;
  supporter: { id: string; username: string | null; displayName: string | null; name: string; image: string | null } | null;
  tier: { id: string; name: string; price: number; currency: string } | null;
};

export function SubscribersList() {
  const [subs, setSubs] = React.useState<Sub[] | null>(null);

  React.useEffect(() => {
    fetch("/api/v1/dashboard/subscribers")
      .then((r) => r.json())
      .then((json) => setSubs(json.data ?? []))
      .catch(() => setSubs([]));
  }, []);

  if (!subs) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
        No members yet. Memberships start when someone picks a tier on your page.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
      {subs.map((s) => (
        <li key={s.id} className="flex items-center gap-3 p-4">
          <Avatar src={s.supporter?.image ?? null} alt={s.supporter?.name ?? "Supporter"} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {s.supporter?.displayName ?? s.supporter?.name ?? "Unknown"}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              joined {timeAgo(s.createdAt)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm">{s.tier?.name ?? "No tier"}</p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
              {s.tier?.price ? `${formatAmount(s.tier.price)} ${s.tier.currency}` : "—"}
            </p>
          </div>
          <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${s.status === "active" ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"}`}>
            {s.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
