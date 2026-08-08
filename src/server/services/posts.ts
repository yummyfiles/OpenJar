import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { checkContent } from "@/lib/moderation";
import { notify } from "./notifications";
import { trackActivity } from "./activity";

export type PostInput = {
  title?: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  status?: "draft" | "published" | "scheduled" | "archived";
  pinned?: boolean;
  scheduledAt?: Date | null;
  poll?: { question: string; options: string[] } | null;
  kind?: "post" | "announcement";
};

export async function createPost(authorId: string, input: PostInput) {
  const moderation = checkContent(`${input.title ?? ""} ${input.content}`);
  if (moderation.blocked) {
    throw new ApiError(400, "This post was flagged by our spam filter", "blocked_content");
  }

  const status = resolveStatus(input);
  const slugBase = input.title ? slugify(input.title) : `post-${Date.now().toString(36)}`;

  const existing = await prisma.post.findUnique({ where: { authorId_slug: { authorId, slug: slugBase } } });
  const slug = existing ? `${slugBase}-${Date.now().toString(36).slice(-4)}` : slugBase;

  const post = await prisma.post.create({
    data: {
      authorId,
      title: input.title || null,
      slug,
      content: input.content,
      excerpt: input.excerpt || null,
      coverImage: input.coverImage || null,
      status,
      pinned: input.pinned ?? false,
      scheduledAt: status === "scheduled" ? input.scheduledAt : null,
      publishedAt: status === "published" ? new Date() : null,
      poll: input.poll
        ? { question: input.poll.question, options: input.poll.options.map((o, i) => ({ id: i, label: o, votes: 0 })) }
        : Prisma.DbNull,
      kind: input.kind ?? "post"
    }
  });

  if (status === "published") {
    await trackActivity(authorId, "post", { slug });
    await notifyFollowersOfPost(authorId);
  }

  return post;
}

export async function updatePost(authorId: string, postId: string, input: Partial<PostInput>) {
  const post = await prisma.post.findFirst({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(404, "Post not found");

  const status = input.status ? resolveStatus(input) : post.status;

  return prisma.post.update({
    where: { id: postId },
    data: {
      title: input.title !== undefined ? input.title || null : post.title,
      content: input.content ?? post.content,
      excerpt: input.excerpt !== undefined ? input.excerpt || null : post.excerpt,
      coverImage: input.coverImage !== undefined ? input.coverImage || null : post.coverImage,
      status,
      pinned: input.pinned ?? post.pinned,
      scheduledAt: status === "scheduled" ? (input.scheduledAt ?? post.scheduledAt) : null,
      publishedAt: status === "published" && !post.publishedAt ? new Date() : post.publishedAt,
      poll: input.poll !== undefined
        ? input.poll
          ? { question: input.poll.question, options: input.poll.options.map((o, i) => ({ id: i, label: o, votes: 0 })) }
          : Prisma.DbNull
        : (post.poll as object) ?? Prisma.DbNull
    }
  });
}

export async function deletePost(authorId: string, postId: string) {
  const post = await prisma.post.findFirst({ where: { id: postId, authorId } });
  if (!post) throw new ApiError(404, "Post not found");
  await prisma.post.delete({ where: { id: postId } });
  return { ok: true };
}

export async function getPostBySlug(authorId: string, slug: string, viewerId?: string | null) {
  const post = await prisma.post.findFirst({
    where: { authorId, slug },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, name: true, image: true, verified: true }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });
  if (!post || post.status !== "published") return null;

  const liked = viewerId
    ? (await prisma.like.findUnique({ where: { userId_postId: { userId: viewerId, postId: post.id } } })) !== null
    : false;

  return { post, liked };
}

export async function getPostById(postId: string) {
  return prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: { id: true, username: true, displayName: true, name: true, image: true, verified: true }
      },
      _count: { select: { likes: true, comments: true } }
    }
  });
}

export async function toggleLike(userId: string, postId: string) {
  const post = await prisma.post.findFirst({ where: { id: postId, status: "published" } });
  if (!post) throw new ApiError(404, "Post not found");

  const existing = await prisma.like.findUnique({ where: { userId_postId: { userId, postId } } });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    return { liked: false };
  }
  await prisma.like.create({ data: { userId, postId } });
  if (post.authorId !== userId) {
    await notify({
      userId: post.authorId,
      actorId: userId,
      type: "like",
      title: "Someone liked your post",
      link: `/${post.id}/${post.slug ?? "post"}`
    });
  }
  return { liked: true };
}

export async function addComment(userId: string, postId: string, content: string, parentId?: string | null) {
  if (parentId) {
    const parent = await prisma.comment.findFirst({ where: { id: parentId, postId } });
    if (!parent) throw new ApiError(404, "Parent comment not found");
  }

  const moderation = checkContent(content);
  if (moderation.blocked) {
    throw new ApiError(400, "This comment was flagged by our spam filter", "blocked_content");
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, status: "published" },
    include: { author: { select: { username: true } } }
  });
  if (!post) throw new ApiError(404, "Post not found");

  const comment = await prisma.comment.create({
    data: { postId, authorId: userId, content, parentId: parentId ?? null }
  });

  if (post.authorId !== userId) {
    await notify({
      userId: post.authorId,
      actorId: userId,
      type: "comment",
      title: "New comment on your post",
      body: content.slice(0, 140),
      link: `/${post.author.username}/${post.slug}`
    });
  }

  return comment;
}

export async function deleteComment(userId: string, commentId: string, isAdmin = false) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new ApiError(404, "Comment not found");
  if (!isAdmin && comment.authorId !== userId) throw new ApiError(403, "Not your comment");
  await prisma.comment.delete({ where: { id: commentId } });
  return { ok: true };
}

export async function listComments(postId: string) {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, username: true, displayName: true, name: true, image: true, verified: true } }
    }
  });
  return comments;
}

export async function votePoll(userId: string, postId: string, optionIndex: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || !post.poll) throw new ApiError(404, "Poll not found");

  const poll = post.poll as { question: string; options: { id: number; label: string; votes: number }[] };
  if (optionIndex < 0 || optionIndex >= poll.options.length) throw new ApiError(400, "Invalid option");
  if (post.pollVotedBy.includes(userId)) throw new ApiError(400, "You already voted");

  poll.options[optionIndex].votes += 1;
  await prisma.post.update({
    where: { id: postId },
    data: { poll: poll as object, pollVotedBy: [...post.pollVotedBy, userId] }
  });
  return { ok: true };
}

export async function listCreatorPosts(authorId: string, viewerId?: string | null, status?: string, take = 20, skip = 0) {
  return prisma.post.findMany({
    where: {
      authorId,
      ...(status ? { status } : { status: { in: ["published", "draft", "scheduled"] } }),
      ...(viewerId === authorId
        ? {}
        : {
            OR: [{ status: "published" }]
          })
    },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    skip,
    take,
    include: {
      _count: { select: { likes: true, comments: true } }
    }
  });
}

function resolveStatus(input: Pick<PostInput, "status" | "scheduledAt">): "draft" | "published" | "scheduled" | "archived" {
  if (input.status === "scheduled") return "scheduled";
  if (input.status === "published") return "published";
  if (input.status === "archived") return "archived";
  if (input.scheduledAt && new Date(input.scheduledAt) > new Date()) return "scheduled";
  if (input.status === "draft") return "draft";
  // a post with content but no explicit status publishes immediately — that's
  // how the editor UX flows
  return "published";
}

async function notifyFollowersOfPost(authorId: string) {
  const followers = await prisma.follow.findMany({ where: { followingId: authorId }, select: { followerId: true } });
  const me = await prisma.user.findUnique({ where: { id: authorId }, select: { username: true } });
  if (!me) return;
  await prisma.notification.createMany({
    data: followers.map((f) => ({
      userId: f.followerId,
      actorId: authorId,
      type: "post" as const,
      title: `${me.username} posted something new`,
      link: `/${me.username}`
    }))
  });
}
