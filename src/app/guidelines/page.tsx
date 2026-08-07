import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "Community Guidelines" };

const RULES: { h: string; p: string }[] = [
  {
    h: "Be honest",
    p: "Describe your work accurately. Don't collect support for things you can't or won't deliver. Don't impersonate other creators or brands."
  },
  {
    h: "No harmful content",
    p: "No hate speech, harassment, doxxing, threats, or content that promotes violence. No content exploiting minors. No adult sexual content on public pages."
  },
  {
    h: "No spam or scams",
    p: "Don't spam links, inflate engagement, run pyramid schemes, or use OpenJar to launder money. Don't make promises of financial returns."
  },
  {
    h: "Respect IP",
    p: "Only post content you have the right to post. Don't upload others' work without permission, and don't gate content that isn't yours."
  },
  {
    h: "Be a good citizen",
    p: "Don't game the platform — fake followers, donation-matching abuse, or coordinated harassment get you removed."
  }
];

export default function GuidelinesPage() {
  return (
    <>
      <StaticHeader
        eyebrow="guidelines"
        title="Community guidelines"
        description="A short set of rules to keep OpenJar a place where creators and supporters trust each other."
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="space-y-6">
          {RULES.map((r) => (
            <section key={r.h} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
              <h2 className="label-mono">{r.h}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{r.p}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-neutral-500">
          See something that violates these guidelines?{" "}
          <a href="/contact" className="text-white underline-offset-4 hover:underline">
            Tell us
          </a>{" "}
          — or use the report feature on the content.
        </p>
      </div>
    </>
  );
}
