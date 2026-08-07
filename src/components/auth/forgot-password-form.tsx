"use client";

import * as React from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password"
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Something went wrong");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-neutral-800 p-6 text-center">
        <p className="text-sm text-neutral-300">Check your inbox.</p>
        <p className="mt-2 text-sm text-neutral-500">
          If an account exists for that email, we sent a reset link (delivered via Resend when configured).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
