"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = React.useState(false);

  if (!token) {
    return (
      <p className="text-sm text-red-400">
        This reset link is missing its token. Request a new one.
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const newPassword = String(new FormData(e.currentTarget).get("password") ?? "");
    const { error } = await authClient.resetPassword({ newPassword, token });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not reset your password");
      return;
    }
    toast.success("Password updated — sign in with your new password");
    router.push("/login");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? "Updating…" : "Reset password"}
      </Button>
    </form>
  );
}
