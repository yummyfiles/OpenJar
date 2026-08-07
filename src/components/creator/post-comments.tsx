"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { timeAgo, cn } from "@/lib/utils";

export type CommentView = {
  id: string;
  content: string;
  createdAt: Date;
  author: { id: string; username: string | null; displayName: string | null; name: string; image: string | null; verified: boolean };
};

export function LikeButton({ postId, initialLiked, initialCount }: { postId: string; initialLiked: boolean; initialCount: number }) {
  const { data: session } = useSession();
  const [liked, setLiked] = React.useState(initialLiked);
  const [count, setCount] = React.useState(initialCount);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!session?.user) {
      window.location.href = "/login";
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/like`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setLiked(json.data.liked);
      setCount((c) => c + (json.data.liked ? 1 : -1));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-neutral-800 px-3 py-1.5 font-mono text-xs transition-colors",
        liked ? "border-white bg-white text-black" : "text-neutral-400 hover:border-neutral-600 hover:text-white"
      )}
    >
      <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} />
      {count}
    </button>
  );
}

export function CommentSection({ postId, initial }: { postId: string; initial: CommentView[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = React.useState<CommentView[]>(initial);
  const [content, setContent] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!session?.user) {
      window.location.href = `/login?next=${window.location.pathname}`;
      return;
    }
    const trimmed = content.trim();
    if (!trimmed) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setComments((c) => [...c, json.data]);
      setContent("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-12">
      <h2 className="label-mono mb-4 flex items-center gap-2">
        <MessageSquare className="h-3.5 w-3.5" /> Comments
      </h2>

      <form onSubmit={submit} className="mb-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={session?.user ? "Join the conversation…" : "Sign in to comment"}
          className="min-h-[80px] resize-none"
          maxLength={4000}
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" size="sm" disabled={busy || content.trim().length === 0}>
            {busy ? "Posting…" : "Comment"}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-neutral-800 p-6 text-center text-sm text-neutral-500">
          No comments yet — be the first.
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="rounded-xl border border-neutral-800/60 bg-neutral-950/40 p-4">
              <div className="flex items-center gap-2.5">
                <Avatar src={comment.author.image} alt={comment.author.name} size="sm" />
                <div>
                  <p className="text-sm font-medium">
                    {comment.author.displayName ?? comment.author.name}{" "}
                    <span className="font-mono text-[10px] text-neutral-500">@{comment.author.username}</span>
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(comment.createdAt)}</p>
                </div>
              </div>
              <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-400">{comment.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
