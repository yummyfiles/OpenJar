"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Github } from "lucide-react";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [loading, setLoading] = React.useState<null | "email" | "github" | "google">(null);
  const [socialError, setSocialError] = React.useState<string | null>(null);

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading("email");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");

    try {
      if (isLogin) {
        const { error } = await signIn.email({ email, password });
        if (error) {
          toast.error(error.message ?? "Could not sign you in");
          return;
        }
        toast.success("Welcome back");
        router.push("/settings");
        router.refresh();
      } else {
        const { error } = await signUp.email({ email, password, name, callbackURL: "/onboarding" });
        if (error) {
          toast.error(error.message ?? "Could not create your account");
          return;
        }
        toast.success("Account created");
        router.push("/onboarding");
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  }

  async function onSocial(provider: "github" | "google") {
    setLoading(provider);
    setSocialError(null);
    const { error } = await signIn.social({
      provider,
      callbackURL: "/onboarding"
    });
    if (error) {
      setSocialError(
        `${provider === "github" ? "GitHub" : "Google"} sign-in is not configured yet. Use email instead.`
      );
    }
    setLoading(null);
  }

  return (
    <form onSubmit={onEmailSubmit} className="flex flex-col gap-4">
      {!isLogin && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" autoComplete="name" required maxLength={60} placeholder="Ada Lovelace" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          minLength={8}
          placeholder={isLogin ? "••••••••" : "At least 8 characters"}
        />
      </div>

      {isLogin && (
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-neutral-500 underline-offset-4 hover:text-white hover:underline">
            Forgot password?
          </Link>
        </div>
      )}

      <Button type="submit" disabled={loading !== null} className="mt-2">
        {loading === "email" && <Spinner />}
        {isLogin ? "Sign in" : "Create your page"}
      </Button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-neutral-800" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-600">or</span>
        <span className="h-px flex-1 bg-neutral-800" />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSocial("github")}
          disabled={loading !== null}
        >
          {loading === "github" ? <Spinner /> : <Github className="h-4 w-4" />}
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onSocial("google")}
          disabled={loading !== null}
          className="font-medium"
        >
          {loading === "google" ? <Spinner /> : <span className="font-mono text-sm">G</span>}
          Continue with Google
        </Button>
      </div>

      {socialError && <p className="text-xs text-red-400">{socialError}</p>}
    </form>
  );
}

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <Link href="/" aria-label="OpenJar home" className="mb-8 flex items-center">
        <Image src="/openjar-logo.png" alt="OpenJar" width={132} height={60} className="h-[60px] w-auto" priority />
      </Link>
      <div className={cn("rounded-xl border border-neutral-800 bg-neutral-950/60 p-6 sm:p-8")}>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mb-6 mt-1.5 text-sm text-neutral-500">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
