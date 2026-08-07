import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ADMIN_ROLES } from "@/lib/constants";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!ADMIN_ROLES.includes(user.role as string)) redirect("/");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="label-mono mb-1">admin console</p>
        <h1 className="text-xl font-bold tracking-tight">OpenJar moderation</h1>
      </div>
      <AdminNav />
      <div className="mt-8">{children}</div>
    </main>
  );
}
