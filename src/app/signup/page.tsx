import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Join OpenJar" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.isCreator ? "/settings" : "/me");

  return (
    <AuthShell title="Join OpenJar" subtitle="Create a page to accept support, or join as a supporter to follow and donate.">
      <AuthForm mode="signup" />
      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-white underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
