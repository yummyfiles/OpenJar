"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatAmount, timeAgo } from "@/lib/utils";

export type PublicDonation = {
  id: string;
  amount: number;
  currency: string;
  message: string | null;
  anonymous: boolean;
  createdAt: string;
  supporterId: string | null;
  supporterName: string | null;
  displayName: string | null;
  supporter: { id: string; username: string | null; displayName: string | null; name: string; image: string | null } | null;
};

export function RecentSupporters({ donations }: { donations: PublicDonation[] }) {
  if (donations.length === 0) return null;

  return (
    <section>
      <h2 className="label-mono oj-accent-text mb-4">Recent supporters</h2>
      <div className="space-y-3">
        {donations.slice(0, 6).map((donation) => {
          const name = donation.displayName ?? donation.supporter?.displayName ?? donation.supporter?.name ?? "Supporter";
          const avatar = donation.supporter?.image ?? null;
          return (
            <div key={donation.id} className="oj-card flex items-center gap-3 rounded-lg border border-neutral-800/60 p-3">
              <Avatar src={avatar} alt={name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{name}</p>
                {donation.message && <p className="truncate text-xs text-neutral-500">“{donation.message}”</p>}
                <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(donation.createdAt)}</p>
              </div>
              <span className="oj-page-text shrink-0 font-mono text-sm">{formatAmount(donation.amount, donation.currency)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
