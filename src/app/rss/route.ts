import { prisma } from "@/lib/prisma";
import { BASE_URL, APP_DESCRIPTION } from "@/lib/constants";
import { publicUserSelect } from "@/server/services/creators";

export const dynamic = "force-dynamic";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildPostUrl(username: string | null, slug: string | null) {
  return `${BASE_URL}/${username ?? "u"}/${slug ?? "post"}`;
}export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 50,
    include: {
      author: { select: publicUserSelect }
    }
  });

  const feedUrl = `${BASE_URL}/rss`;

  const items = posts
    .map((post) => {
      const date = (post.publishedAt ?? post.createdAt).toUTCString();
      const url = buildPostUrl(post.author.username, post.slug);
      const author = post.author.displayName ?? post.author.name;
      const excerpt = post.excerpt ?? post.content.slice(0, 200);
      return `    <item>
      <title>${escapeXml(post.title ?? "Untitled")}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="false">${post.id}</guid>
      <pubDate>${date}</pubDate>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${escapeXml(author)}</dc:creator>
      <description>${escapeXml(excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>OpenJar</title>
    <link>${BASE_URL}</link>
    <description>${escapeXml(APP_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    ${posts.length > 0 ? items : `    <item><title>No posts yet</title><link>${BASE_URL}</link><description>Check back soon.</description></item>`}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate"
    }
  });
}
