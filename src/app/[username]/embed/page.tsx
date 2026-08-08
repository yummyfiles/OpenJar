import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getCreatorPageData } from "@/server/services/creators";
import { SupportPanel } from "@/components/creator/support-panel";
import { Avatar } from "@/components/ui/avatar";

export const dynamic = "force-dynamic";

export default async function EmbedPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerId = session?.user?.id ?? null;

  const data = await getCreatorPageData(username, viewerId);
  if (!data) notFound();

  const user = data.user as {
    displayName: string;
    username: string;
    image?: string | null;
    bio?: string | null;
    minDonation: number;
    allowAnonymous: boolean;
    allowMessages: boolean;
  };
  const tiers = data.tiers.map((t) => ({
    ...t,
    perks: Array.isArray(t.perks) ? t.perks : []
  }));

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-[360px]">
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <div className="flex items-center gap-3">
            <Avatar src={user.image ?? null} alt={user.displayName} size="md" ring />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.displayName}</p>
              <p className="truncate font-mono text-xs text-neutral-500">@{user.username}</p>
            </div>
          </div>

          {user.bio && <p className="mt-3 line-clamp-2 text-xs text-neutral-400">{user.bio}</p>}

          <div className="mt-4">
            <SupportPanel
              embedded
              username={username}
              tiers={tiers}
              minDonation={user.minDonation}
              allowAnonymous={user.allowAnonymous}
              allowMessages={user.allowMessages}
            />
          </div>
        </div>

        <p className="mt-3 text-center font-mono text-[10px] text-neutral-600">
          Powered by OpenJar ·{" "}
          <Link href="/" target="_top" className="underline underline-offset-2 hover:text-neutral-400">
            free &amp; open source
          </Link>
        </p>
      </div>
    </div>
  );
}
