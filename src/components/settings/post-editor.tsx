"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Eye, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Markdown } from "@/components/markdown";

type Status = "draft" | "published" | "scheduled" | "archived";

export default function PostEditor() {
  const params = useParams<{ id?: string }>();
  const id = params?.id;
  const router = useRouter();
  const isNew = id === undefined || id === "new";

  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [excerpt, setExcerpt] = React.useState("");
  const [status, setStatus] = React.useState<Status>("draft");
  const [pinned, setPinned] = React.useState(false);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [preview, setPreview] = React.useState(false);

  React.useEffect(() => {
    if (isNew) return;
    fetch(`/api/v1/posts/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        setTitle(json.data.title ?? "");
        setContent(json.data.content ?? "");
        setExcerpt(json.data.excerpt ?? "");
        setStatus(json.data.status ?? "draft");
        setPinned(Boolean(json.data.pinned));
      })
      .catch(() => toast.error("Failed to load post"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  async function save(nextStatus?: Status) {
    if (!content.trim()) {
      toast.error("Post content is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(isNew ? "/api/v1/posts" : `/api/v1/posts/${id}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, excerpt, status: nextStatus ?? status, pinned })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed to save");
      toast.success(nextStatus === "published" ? "Post published" : "Saved");
      if (json.data.username) router.push(`/${json.data.username}`);
      else router.push("/settings/content");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => router.push("/settings/content")} className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> back to content
      </button>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          maxLength={160}
          className="max-w-xl text-lg font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-3.5 w-3.5" /> {preview ? "Edit" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => save("draft")} disabled={saving}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save draft
          </Button>
          <Button size="sm" onClick={() => save("published")} disabled={saving}>
            {isNew ? "Publish" : "Update"}
          </Button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
        <label className="flex items-center gap-2">
          <Switch checked={pinned} onCheckedChange={setPinned} />
          <span className="text-neutral-400">Pin to top of profile</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-neutral-400">Status:</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 font-mono text-xs text-neutral-300 outline-none focus:border-neutral-600">
            {["draft", "published", "scheduled", "archived"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Short summary shown in feeds"
          maxLength={300}
          className="mt-2 h-16 resize-none"
        />
      </div>

      {preview ? (
        <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
          {content.trim() ? <Markdown content={content} /> : <p className="text-sm text-neutral-500">Nothing to preview yet.</p>}
        </div>
      ) : (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write in Markdown. **bold**, # headings, `code`, links…"
          className="mt-6 h-96 resize-y font-mono"
          maxLength={100_000}
        />
      )}
    </div>
  );
}
