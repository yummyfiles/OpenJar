import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardingDone ? "/dashboard" : "/onboarding");

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your page and supporters.">
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-neutral-500">
        New here?{" "}
        <Link href="/signup" className="text-white underline-offset-4 hover:underline">
          Create your page
        </Link>
      </p>
    </AuthShell>
  );
}
