"use client";

import Link from "next/link";
import { CalendarDays, MessageSquare, Pin } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export type PublicPost = {
  id: string;
  title: string | null;
  slug: string | null;
  excerpt: string | null;
  coverImage: string | null;
  pinned: boolean;
  publishedAt: string | null;
  createdAt: string;
  _count: { likes: number; comments: number };
  author: { username: string | null };
};

export function PostListItem({ post, username }: { post: PublicPost; username: string }) {
  const href = `/${username}/${post.slug ?? post.id}`;
  const body = post.excerpt || post.title || "";

  return (
    <article className="oj-card rounded-xl border border-neutral-800 p-5 transition-all hover:-translate-y-1 hover:border-neutral-600">
      {post.pinned && (
        <span className="mb-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
          <Pin className="h-3 w-3" /> pinned
        </span>
      )}
      <h2 className="oj-page-text text-lg font-semibold tracking-tight">
        <Link href={href} className="hover:text-white">
          {post.title}
        </Link>
      </h2>
      {body && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">{body}</p>}

      <div className="mt-4 flex items-center gap-4 border-t border-neutral-900 pt-3 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="h-3 w-3" /> {timeAgo(post.publishedAt ?? post.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="h-3 w-3" /> {post._count.comments}
        </span>
      </div>
    </article>
  );
}

export function PostListView({ posts, username }: { posts: PublicPost[]; username: string }) {
  if (posts.length === 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="label-mono oj-accent-text mb-4">Updates</h2>
      {posts.map((post) => (
        <PostListItem key={post.id} post={post} username={username} />
      ))}
    </section>
  );
}
