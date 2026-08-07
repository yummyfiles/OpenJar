"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CREATOR_CATEGORIES } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const STEPS = ["Basics", "What you do", "Links"];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = React.useState(0);

  const [form, setForm] = React.useState({
    username: (session?.user?.username as string | undefined) ?? "",
    displayName: (session?.user?.displayName as string | undefined) ?? session?.user?.name ?? "",
    category: "",
    tags: [] as string[],
    bio: "",
    website: "",
    github: "",
    twitter: "",
    location: "",
    isCreator: true
  });
  const [busy, setBusy] = React.useState(false);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleTag(tag: string) {
    set(
      "tags",
      form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag].slice(0, 6)
    );
  }

  async function submit() {
    if (form.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags: form.tags, completeOnboarding: true })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Something went wrong");
      toast.success("Your page is live!");
      router.push(json.data.redirect ?? `/${form.username.trim().toLowerCase()}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  const canNext =
    step === 0 ? form.username.trim().length >= 3 : step === 1 ? form.category !== "" : true;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        <p className="label-mono mb-2">claim your page</p>
        <h1 className="text-3xl font-bold tracking-tight">Make your page</h1>
        <p className="mt-2 text-sm text-neutral-500">Takes about a minute. You can change everything later.</p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            {i > 0 && <span className="h-px w-8 bg-neutral-800" />}
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                i === step ? "border-white bg-white text-black" : i < step ? "border-neutral-700 text-neutral-300" : "border-neutral-800 text-neutral-600"
              )}
            >
              {label}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 sm:p-8">
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <Label htmlFor="username">Username</Label>
              <p className="mt-1 text-xs text-neutral-500">This becomes your page URL: openjar.app/yourname</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-sm text-neutral-600">/</span>
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) => set("username", e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="yourname"
                  className="font-mono"
                />
              </div>
              {form.username.length > 0 && form.username.length < 3 && (
                <p className="mt-1.5 text-xs text-amber-400">At least 3 characters</p>
              )}
            </div>

            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => set("displayName", e.target.value)}
                placeholder="How should people see you?"
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-neutral-800 p-4">
              <div>
                <p className="text-sm font-medium">Accept donations & memberships</p>
                <p className="mt-0.5 text-xs text-neutral-500">Turn on to add a support panel to your page</p>
              </div>
              <button
                role="switch"
                aria-checked={form.isCreator}
                onClick={() => set("isCreator", !form.isCreator)}
                className={cn("relative h-6 w-11 rounded-full transition-colors", form.isCreator ? "bg-white" : "bg-neutral-800")}
              >
                <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-black transition-all", form.isCreator ? "left-[22px]" : "left-0.5")} />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label>Category</Label>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {CREATOR_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => set("category", c.id)}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                      form.category === c.id ? "border-white bg-neutral-900" : "border-neutral-800 hover:border-neutral-600"
                    )}
                  >
                    <span className="block font-medium">{c.label}</span>
                    <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-neutral-600">{c.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags (up to 6)</Label>
              <div className="mt-3 flex flex-wrap gap-2">
                {["open-source", "Typescript", "Rust", "Python", "art", "music", "games", "tutorials", "live", "commissions", "sci-fi", "UI"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors",
                      form.tags.includes(tag) ? "border-white bg-white text-black" : "border-neutral-800 text-neutral-500 hover:border-neutral-600"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="What do you make? Why should people support you?"
                className="mt-2 h-28 resize-none"
                maxLength={2000}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="github">GitHub username</Label>
              <Input id="github" value={form.github} onChange={(e) => set("github", e.target.value)} placeholder="github" className="mt-2 font-mono" />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input id="twitter" value={form.twitter} onChange={(e) => set("twitter", e.target.value)} placeholder="@you" className="mt-2 font-mono" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="City, Country" className="mt-2" />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => (step === 0 ? router.push("/") : setStep(step - 1))} disabled={busy}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={() => canNext && setStep(step + 1)} disabled={!canNext}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" onClick={submit} disabled={busy}>
              {busy ? "Publishing…" : (
                <>
                  <Sparkles className="h-4 w-4" /> Publish page
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {form.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    </main>
  );
}
