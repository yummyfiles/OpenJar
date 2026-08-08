import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

// cache this so we dont keep hitting the api lol — better-auth keeps the
// hashing cost low by reusing a module-level instance.
export const auth = betterAuth({
  baseURL: process.env.BASE_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  trustedOrigins: (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail, passwordResetHtml } = await import("@/server/services/emails");
      await sendEmail({
        to: user.email,
        subject: "Reset your OpenJar password",
        html: passwordResetHtml({ url, name: user.name })
      });
    }
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? ""
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }
  },

  // surface our custom user fields in the session object so the UI doesnt
  // need an extra db round trip for every header render
  user: {
    additionalFields: {
      username: { type: "string", required: false, input: false },
      displayName: { type: "string", required: false, input: false },
      role: { type: "string", required: false, defaultValue: "user", input: false },
      verified: { type: "boolean", required: false, defaultValue: false, input: false },
      isCreator: { type: "boolean", required: false, defaultValue: false, input: false },
      onboardingDone: { type: "boolean", required: false, defaultValue: false, input: false }
    }
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // slide every day
    cookieCache: { enabled: true, maxAge: 5 * 60 }
  },

  advanced: {
    cookiePrefix: "openjar",
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  }
});
