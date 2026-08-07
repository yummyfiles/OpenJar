import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "Terms of Service" };

const SECTIONS: { h: string; p: string }[] = [
  {
    h: "1. Our relationship",
    p: "OpenJar is a platform that lets creators accept support and lets supporters fund them. By using OpenJar you agree to these terms. If you are a creator, you are responsible for your page and content. If you are a supporter, you are responsible for your payments."
  },
  {
    h: "2. Accounts",
    p: "You must be 13 or older to use OpenJar. You are responsible for your account, your credentials, and anything that happens on your account. We may suspend or ban accounts that violate these terms or the community guidelines."
  },
  {
    h: "3. Acceptable use",
    p: "Do not use OpenJar to promote illegal activity, hate, harassment, spam, or fraud. Do not impersonate others, collect supporter funds under false pretenses, or use the platform to launder money. Creators must not misrepresent what supporters will receive."
  },
  {
    h: "4. Payments",
    p: "Payments are processed by third-party processors (such as Stripe and Lemon Squeezy). We pass through their standard fees. Donations are generally non-refundable; memberships may be cancelled anytime through the platform. Refunds are at the creator's discretion except where required by law."
  },
  {
    h: "5. Intellectual property",
    p: "You keep the rights to everything you post. You grant OpenJar a limited license to store, display, and process your content so we can run the service. Content on OpenJar may not be scraped or reused without permission."
  },
  {
    h: "6. Termination",
    p: "You may delete your account and export your data at any time. We may suspend or terminate accounts that violate these terms. Upon termination, outstanding balance obligations still apply."
  },
  {
    h: "7. Disclaimers & liability",
    p: "OpenJar is provided 'as is' without warranties. To the maximum extent permitted by law, we are not liable for indirect or consequential damages. We are not responsible for the actions of creators or supporters on the platform."
  },
  {
    h: "8. Changes",
    p: "We may update these terms. Material changes will be announced on the platform. Continued use after changes take effect means you accept the updated terms."
  },
  {
    h: "9. Contact",
    p: "Questions about these terms? Reach us through the contact page."
  }
];

export default function TermsPage() {
  return (
    <>
      <StaticHeader eyebrow="legal" title="Terms of Service" description="Last updated: 2026. Plain-language terms for using OpenJar." />
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
