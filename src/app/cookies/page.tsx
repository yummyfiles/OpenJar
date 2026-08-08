import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "Cookie Policy" };

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "1. What cookies we use",
    p: "OpenJar uses cookies for two things: keeping you signed in (authentication) and remembering your preferences (such as theme). We do not use third-party advertising cookies."
  },
  {
    h: "2. Authentication",
    p: "When you sign in, we set a session cookie that lets us recognize you on return visits. It expires after 7 days of inactivity. Without it, features like posting, following, and donating while signed in won't work."
  },
  {
    h: "3. Analytics & payments",
    p: "Payment providers (Stripe, Lemon Squeezy) may set their own cookies on checkout pages to process your payment. If you enable error reporting, Sentry may store a session identifier. You can block these and the site will still function."
  },
  {
    h: "4. Managing cookies",
    p: "You can clear cookies in your browser settings at any time. Doing so signs you out and resets preferences, but does not delete your account or data."
  }
];

export default function CookiesPage() {
  return (
    <>
      <StaticHeader eyebrow="legal" title="Cookie Policy" description="Last updated: 2026. What we store in your browser and why." />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-sm font-semibold tracking-tight">{s.h}</h2>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
