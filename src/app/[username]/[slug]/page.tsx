import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, BadgeCheck, CalendarDays } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPostBySlug, listComments } from "@/server/services/posts";
import { findCreatorByUsername } from "@/server/services/creators";
import { Markdown } from "@/components/markdown";
import { Avatar } from "@/components/ui/avatar";
import { LikeButton, CommentSection, type CommentView } from "@/components/creator/post-comments";
import { timeAgo, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const { username, slug } = await params;
  const creator = await findCreatorByUsername(username);
  if (!creator || !creator.isCreator) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerId = session?.user?.id ?? null;

  const data = await getPostBySlug(creator.id, slug, viewerId);
  if (!data) notFound();
  const { post } = data;

  const comments = (await listComments(post.id)) as unknown as CommentView[];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href={`/${username}`} className="inline-flex items-center gap-1.5 font-mono text-xs text-neutral-500 hover:text-white">
        <ArrowLeft className="h-3.5 w-3.5" /> back to @{username}
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>

        <div className="mt-4 flex items-center gap-3">
          <Avatar src={creator.image} alt={creator.name} size="sm" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{creator.displayName || creator.name}</span>
            {creator.verified && <BadgeCheck className="h-4 w-4 text-white" />}
            <span className="text-neutral-500">@</span>
            <span className="font-mono text-neutral-500">{username}</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
            <CalendarDays className="h-3.5 w-3.5" />
            {post.publishedAt ? formatDate(post.publishedAt, { year: "numeric", month: "short", day: "numeric" }) : timeAgo(post.createdAt)}
          </span>
        </div>
      </header>

      {post.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverImage} alt="" className="mt-8 aspect-video w-full rounded-xl border border-neutral-800 object-cover" />
      )}

      <article className="mt-8">
        <Markdown content={post.content} />
      </article>

      <div className="mt-10 flex items-center gap-3 border-t border-neutral-900 pt-6">
        <LikeButton postId={post.id} initialLiked={data.liked} initialCount={post._count.likes} />
      </div>

      <CommentSection postId={post.id} initial={comments} />
    </main>
  );
}
