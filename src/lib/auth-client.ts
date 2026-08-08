import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// inferAdditionalFields is type-only — the auth config is never bundled here
// NOTE: use the browser's own origin rather than the server-only BASE_URL so
// OAuth callback URLs (registered per-origin in Google/GitHub consoles) always
// match what the browser is actually on. BASE_URL is not inlined into the
// client bundle, so it silently fell back to localhost:3000 and broke Google
// sign-in on any deployed domain.
export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_URL ??
    (typeof window !== "undefined" ? window.location.origin : process.env.BASE_URL ?? "http://localhost:3000"),
  plugins: [inferAdditionalFields<typeof auth>()]
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type SessionUser = typeof auth.$Infer.Session.user;
