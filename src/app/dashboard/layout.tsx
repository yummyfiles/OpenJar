import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUserFull } from "@/lib/session";
import { Avatar } from "@/components/ui/avatar";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUserFull();
  if (!user) redirect("/login?next=/dashboard");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Avatar src={user.image} alt={user.name} size="lg" />
        <div>
          <p className="label-mono mb-0.5">creator dashboard</p>
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
          <DashboardNav />
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
