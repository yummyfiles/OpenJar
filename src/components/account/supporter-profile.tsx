"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

type MeUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  displayName: string | null;
  createdAt: Date;
};

export function SupporterProfile({ user }: { user: MeUser }) {
  const [displayName, setDisplayName] = React.useState(user.displayName ?? user.name);
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "avatars");
      const res = await fetch("/api/v1/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
      const patch = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: json.data.url })
      });
      const patchJson = await patch.json();
      if (!patch.ok) throw new Error(patchJson?.error?.message ?? "Could not update photo");
      toast.success("Profile photo updated");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveName() {
    const value = displayName.trim();
    if (!value) {
      toast.error("Name can't be empty");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: value })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not save");
      toast.success("Saved");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
        <p className="label-mono mb-4">my profile</p>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <Avatar src={user.image} alt={user.name} size="xl" />
            <label className="absolute -bottom-1 -right-1 cursor-pointer rounded-full border border-neutral-700 bg-neutral-900 p-1 text-neutral-300 transition-colors hover:text-white">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              <span className="sr-only">Upload photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadAvatar(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          <div className="w-full space-y-1.5 text-left">
            <Label htmlFor="displayName">Display name</Label>
            <div className="flex gap-2">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={60}
                className="h-9"
              />
              <Button size="sm" onClick={saveName} disabled={busy || displayName.trim() === (user.displayName ?? user.name)}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>

          <div className="w-full space-y-0.5 text-left">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">email</p>
            <p className="text-sm text-neutral-200">{user.email}</p>
          </div>
          <div className="w-full space-y-0.5 text-left">
            <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">member since</p>
            <p className="text-sm text-neutral-400">{new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/discover">Discover creators</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/onboarding">Become a creator</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
