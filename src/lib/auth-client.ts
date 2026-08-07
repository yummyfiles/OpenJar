import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth";

// inferAdditionalFields is type-only — the auth config is never bundled here
export const authClient = createAuthClient({
  baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()]
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

export type SessionUser = typeof auth.$Infer.Session.user;
