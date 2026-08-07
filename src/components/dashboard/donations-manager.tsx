"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
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
  const [amount, setAmount] = React.useState("");
  const [supporterName, setSupporterName] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [anonymous, setAnonymous] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/v1/me/dashboard")
      .then((r) => r.json())
      .then((json) => setDonations(json.data?.recentDonations ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function record(e: React.FormEvent) {
    e.preventDefault();
    const cents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/v1/dashboard/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: cents, supporterName, message, anonymous })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      toast.success("Donation recorded");
      setAmount("");
      setSupporterName("");
      setMessage("");
      setAnonymous(false);
      setDonations((d) => [json.data, ...d]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={record} className="h-fit rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="label-mono flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" /> Record donation
        </h2>
        <p className="mt-2 text-xs text-neutral-500">Log cash, crypto, or off-platform support.</p>

        <div className="mt-4">
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="25.00"
            className="mt-2"
            required
          />
        </div>
        <div className="mt-3">
          <Label htmlFor="supporter">Supporter name (optional)</Label>
          <Input id="supporter" value={supporterName} onChange={(e) => setSupporterName(e.target.value)} className="mt-2" maxLength={120} />
        </div>
        <div className="mt-3">
          <Label htmlFor="msg">Message (optional)</Label>
          <Textarea id="msg" value={message} onChange={(e) => setMessage(e.target.value)} className="mt-2 h-20 resize-none" maxLength={1000} />
        </div>
        <label className="mt-3 flex items-center justify-between rounded-lg border border-neutral-800 px-3 py-2">
          <span className="text-sm text-neutral-400">Anonymous</span>
          <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-white" />
        </label>

        <Button type="submit" className="mt-4 w-full" disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Record"}
        </Button>
      </form>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
        <h2 className="label-mono">recent donations</h2>
        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-neutral-600" />
          </div>
        ) : donations.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">No donations recorded yet.</p>
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
    </div>
  );
}
