"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
  actor: { id: string; name: string; username: string | null; image: string | null; displayName: string | null } | null;
};

export function NotificationsList() {
  const [items, setItems] = React.useState<Notification[] | null>(null);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/v1/me/notifications")
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data?.notifications ?? []);
        setUnread(json.data?.unread ?? 0);
      })
      .catch(() => setItems([]));
  }, []);

  async function markAllRead() {
    try {
      await fetch("/api/v1/me/notifications", { method: "POST" });
      setItems((r) => r?.map((n) => ({ ...n, read: true })) ?? []);
      setUnread(0);
      toast.success("All marked as read");
    } catch {
      toast.error("Failed to mark as read");
    }
  }

  if (!items) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="label-mono">
          notifications {unread > 0 && <span className="ml-1 text-white">({unread} new)</span>}
        </h2>
        {unread > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-neutral-800 p-10 text-center text-sm text-neutral-500">
          <Bell className="mx-auto mb-2 h-5 w-5 text-neutral-600" />
          No notifications yet. Likes, follows, and donations will show up here.
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
          {items.map((n) => {
            const inner = (
              <>
                <Avatar src={n.actor?.image ?? null} alt={n.actor?.name ?? "OpenJar"} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className={cn("font-medium", !n.read && "text-white")}>{n.title}</span>
                    {n.body && <span className="ml-2 text-neutral-500">{n.body}</span>}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-600">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-white" />}
              </>
            );
            return (
              <li key={n.id} className={cn("p-4", !n.read && "bg-neutral-900/40")}>
                {n.link ? (
                  <Link href={n.link} className="flex items-center gap-3 hover:opacity-80">
                    {inner}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
