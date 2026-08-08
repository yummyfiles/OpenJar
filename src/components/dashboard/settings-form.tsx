"use client";

import * as React from "react";
import { toast } from "sonner";
import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { CREATOR_CATEGORIES } from "@/lib/constants";

type StripeState = {
  loading: boolean;
  connected: boolean;
  configured: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  link: string | null;
};

export function SettingsForm({ initial }: { initial: Record<string, unknown> }) {
  const [form, setForm] = React.useState({
    displayName: (initial.displayName as string) ?? "",
    bio: (initial.bio as string) ?? "",
    website: (initial.website as string) ?? "",
    github: (initial.github as string) ?? "",
    twitter: (initial.twitter as string) ?? "",
    location: (initial.location as string) ?? "",
    category: (initial.category as string) ?? "",
    currency: (initial.currency as string) ?? "usd",
    accent: (initial.accent as string) ?? ""
  });
  const [busy, setBusy] = React.useState(false);
  const [githubBusy, setGithubBusy] = React.useState(false);
  const [stripe, setStripe] = React.useState<StripeState>({
    loading: true,
    connected: false,
    configured: false,
    chargesEnabled: false,
    payoutsEnabled: false,
    link: null
  });

  React.useEffect(() => {
    fetch("/api/v1/me/stripe-connect")
      .then((r) => r.json())
      .then((json) => {
        const d = json.data ?? {};
        setStripe({
          loading: false,
          connected: Boolean(d.connected),
          configured: Boolean(d.configured),
          chargesEnabled: Boolean(d.chargesEnabled),
          payoutsEnabled: Boolean(d.payoutsEnabled),
          link: d.dashboardUrl ?? null
        });
      })
      .catch(() => setStripe((s) => ({ ...s, loading: false })));
  }, []);

  async function connectStripe() {
    setStripe((s) => ({ ...s, loading: true }));
    try {
      const res = await fetch("/api/v1/me/stripe-connect", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not connect Stripe");
      const url = json.data?.onboardingUrl ?? json.data?.dashboardUrl;
      if (url) window.location.href = url;
      else setStripe((s) => ({ ...s, connected: true, loading: false }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not connect Stripe");
      setStripe((s) => ({ ...s, loading: false }));
    }
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed to save");
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  async function refreshGitHub() {
    setGithubBusy(true);
    try {
      const res = await fetch("/api/v1/dashboard/github", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed to refresh");
      toast.success("GitHub data refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to refresh");
    } finally {
      setGithubBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h2 className="label-mono">profile</h2>

        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input id="displayName" value={form.displayName} onChange={(e) => set("displayName", e.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} className="mt-2 h-28 resize-none" maxLength={2000} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="github">GitHub username</Label>
            <Input id="github" value={form.github} onChange={(e) => set("github", e.target.value)} className="mt-2 font-mono" />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter / X</Label>
            <Input id="twitter" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} className="mt-2 font-mono" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="category">Category</Label>
            <select id="category" value={form.category} onChange={(e) => set("category", e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300 outline-none focus:border-neutral-600">
              <option value="">None</option>
              {CREATOR_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <select id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-sm text-neutral-300 outline-none focus:border-neutral-600">
              {["usd", "eur", "gbp", "cad", "aud", "jpy", "chf", "brl"].map((c) => (
                <option key={c} value={c}>{c.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="accent">Accent color</Label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(form.accent) ? form.accent : "#a3e635"}
              onChange={(e) => set("accent", e.target.value)}
              className="h-9 w-14 cursor-pointer rounded border border-neutral-800 bg-transparent"
            />
            <Input id="accent" value={form.accent} onChange={(e) => set("accent", e.target.value)} placeholder="#a3e635" className="font-mono" maxLength={7} />
          </div>
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
        </Button>
      </form>

      <div className="space-y-6">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
          <h2 className="label-mono">stripe payouts</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Donations and memberships go straight to your bank via Stripe Connect. Stripe handles identity
            verification, taxes, and payouts. OpenJar takes no cut.
          </p>
          {stripe.loading ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking payout status…
            </div>
          ) : !stripe.configured ? (
            <p className="mt-4 text-sm text-amber-400/90">
              Payouts aren&apos;t enabled on this instance yet. Set STRIPE_SECRET_KEY to turn them on.
            </p>
          ) : (
            <div className="mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{stripe.connected ? "Connected" : "Not connected"}</p>
                  {stripe.connected ? (
                    <p className="mt-0.5 text-xs text-neutral-500">
                      Charges {stripe.chargesEnabled ? "enabled" : "pending"} · Payouts{" "}
                      {stripe.payoutsEnabled ? "enabled" : "pending"}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-neutral-500">Connect to start receiving payouts.</p>
                  )}
                </div>
                <Button variant="outline" onClick={connectStripe} disabled={stripe.loading}>
                  {stripe.loading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : stripe.connected ? (
                    <>
                      Stripe dashboard <ExternalLink className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    "Connect Stripe"
                  )}
                </Button>
              </div>
              {stripe.connected && stripe.link && (
                <a href={stripe.link} className="mt-3 inline-block text-xs text-neutral-500 underline underline-offset-2">
                  Open Stripe dashboard →
                </a>
              )}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
          <h2 className="label-mono">github sync</h2>
          <p className="mt-2 text-sm text-neutral-500">
            Pulls your repos, stars, languages, and contribution graph onto your page. Refresh is rate-limited.
          </p>
          <Button variant="outline" onClick={refreshGitHub} disabled={githubBusy || !form.github} className="mt-4">
            {githubBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Refresh GitHub data
          </Button>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
          <h2 className="label-mono">membership tiers</h2>
          <p className="mt-2 text-sm text-neutral-500">Tier management is coming to the dashboard soon. Until then, use the API.</p>
          <code className="mt-3 block rounded-lg border border-neutral-800 bg-neutral-900 p-3 font-mono text-xs text-neutral-400">
            POST /api/v1/tiers {"{ \"name\": \"Supporter\", \"price\": 500 }"}
          </code>
        </div>
      </div>
    </div>
  );
}
