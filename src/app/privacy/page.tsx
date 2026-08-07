import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "Privacy Policy" };

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "What we collect",
    p: "Account data you provide (username, email, display name, profile fields). Content you post. Support and engagement data (donations, subscriptions, follows, likes, comments). Basic usage data such as page views. We do not sell your personal data."
  },
  {
    h: "Payments",
    p: "Payment details (cards, billing addresses) are handled by third-party processors like Stripe and Lemon Squeezy. We never see or store your full card number. Processor's privacy policies apply to that data."
  },
  {
    h: "Cookies & sessions",
    p: "We use cookies to keep you signed in and to operate the service. We may use privacy-respecting analytics. We do not use third-party tracking for ads."
  },
  {
    h: "Public information",
    p: "Your profile, posts, goals, and public supporters list are visible to anyone. Usernames are unique identifiers. Supporters may choose to donate anonymously."
  },
  {
    h: "Third-party services",
    p: "GitHub sync fetches public data you connect. Social sign-in providers share the profile data you authorize. We only use this data to provide the features you request."
  },
  {
    h: "Data retention & export",
    p: "We keep your data while your account is active. You can export your data and delete your account at any time; backups may persist for a short period afterwards."
  },
  {
    h: "Your rights",
    p: "Depending on your jurisdiction you may have rights to access, correct, or delete your data. Contact us through the contact page to exercise them."
  },
  {
    h: "Children",
    p: "OpenJar is not directed at children under 13 and we do not knowingly collect their data."
  },
  {
    h: "Changes",
    p: "We may update this policy and will announce material changes."
  }
];

export default function PrivacyPage() {
  return (
    <>
      <StaticHeader eyebrow="legal" title="Privacy Policy" description="Last updated: 2026. How OpenJar handles your data." />
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
