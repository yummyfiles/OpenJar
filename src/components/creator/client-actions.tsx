"use client";

import * as React from "react";
import { toast } from "sonner";
import { Bookmark as BookmarkIcon, UserPlus, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";

// fires once per page load so dashboard analytics have visitor data
export function CreatorViewBeacon({ username }: { username: string }) {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/v1/creators/${username}/view`, { method: "POST" }).catch(() => {});
  }, [username]);

  return null;
}

export function FollowButton({
  username,
  initialFollowing,
  className
}: {
  username: string;
  initialFollowing: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const [following, setFollowing] = React.useState(initialFollowing);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!session?.user) {
      window.location.href = `/login?next=/${username}`;
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/creators/${username}/follow`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setFollowing(json.data.following);
      toast.success(json.data.following ? "Following" : "Unfollowed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant={following ? "outline" : "secondary"} size="sm" onClick={onClick} disabled={busy} className={className}>
      {following ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
      {following ? "Following" : "Follow"}
    </Button>
  );
}

export function BookmarkButton({
  username,
  initialBookmarked,
  className
}: {
  username: string;
  initialBookmarked: boolean;
  className?: string;
}) {
  const { data: session } = useSession();
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);
  const [busy, setBusy] = React.useState(false);

  async function onClick() {
    if (!session?.user) {
      window.location.href = `/login?next=/${username}`;
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/v1/creators/${username}/bookmark`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed");
      setBookmarked(json.data.bookmarked);
      toast.success(json.data.bookmarked ? "Saved" : "Removed from bookmarks");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={busy}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark creator"}
      className={cn(className, bookmarked && "text-white")}
    >
      <BookmarkIcon className={cn("h-4 w-4", bookmarked && "fill-current")} />
    </Button>
  );
}
