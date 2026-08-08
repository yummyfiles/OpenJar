import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserFull } from "@/lib/session";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SettingsNav } from "@/components/settings/settings-nav";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserFull();
  if (!user) redirect("/login?next=/settings");

  if (!user.isCreator) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16">
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-center">
          <p className="label-mono mb-2">settings</p>
          <h1 className="text-xl font-bold tracking-tight">You don&apos;t have a creator page yet</h1>
          <p className="mt-2 text-sm text-neutral-500">
            The settings area is where creators manage their page, supporters, and funding. Create your page to get started.
          </p>
          <Button className="mt-5 w-full" asChild>
            <Link href="/onboarding">Create your page</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar src={user.image} alt={user.name} size="lg" />
        <div>
          <p className="label-mono mb-0.5">creator settings</p>
          <h1 className="text-xl font-bold tracking-tight">{user.displayName || user.name}</h1>
        </div>
        <div className="ml-auto hidden items-center gap-3 sm:flex">
          {user.isCreator && (
            <Link
              href={`/${user.username ?? user.id}`}
              className="rounded-lg border border-neutral-800 px-3 py-1.5 font-mono text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white"
            >
              view page
            </Link>
          )}
          {!user.onboardingDone && (
            <Link href="/onboarding" className="rounded-lg bg-white px-3 py-1.5 font-mono text-xs font-medium text-black">
              finish setup
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SettingsNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
