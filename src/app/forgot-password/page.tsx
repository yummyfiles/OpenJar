import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-form";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Reset your password" subtitle="We'll email you a link to set a new one.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
