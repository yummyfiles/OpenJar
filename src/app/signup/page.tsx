import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { AuthForm, AuthShell } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create your page" };

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.onboardingDone ? "/dashboard" : "/onboarding");

  return (
    <AuthShell title="Create your page" subtitle="Free forever. Claim your name, start in minutes.">
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
