import Link from "next/link";
import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  {
    title: "Open by default",
    body: "OpenJar is MIT-licensed open source. The code is public, the fees are transparent, and there are no dark patterns or hidden middlemen deciding what you can build."
  },
  {
    title: "Creators come first",
    body: "We only make money when you do — and even then, we only pass through standard payment processor fees. When we reach higher volume, we may ask for optional tips. Never a requirement."
  },
  {
    title: "Data portability",
    body: "You own your content, your supporters, and your relationships. Export anything, anytime. No lock-in, no hostage-taking, no walled garden."
  }
];

export default function AboutPage() {
  return (
    <>
      <StaticHeader
        eyebrow="about openjar"
        title="Support for the people building the open web"
        description="OpenJar is a free, open-source platform where anyone can support the developers, artists, and creators doing great work — with one-time donations, memberships, and project funding."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <section className="space-y-4 text-sm leading-relaxed text-neutral-400">
          <p>
            Most creator platforms charge 8–12% and gate your audience behind their apps. We think that is backwards.
            The people making the open web — the ones shipping packages, libraries, art, and tutorials that anyone can use —
            deserve a simpler way to get paid.
          </p>
          <p>
            OpenJar started as a question: what if supporting a creator worked like putting a few dollars in a jar? No
            contracts, no lock-in, no middlemen. Just an open, transparent way to say thanks and help keep the work going.
          </p>
          <p>
            Today OpenJar gives every creator a page with a donation jar, membership tiers, funding goals, GitHub sync, and
            rich posts. It is free, self-hostable, and MIT-licensed. If you want something different, you can fork it.
          </p>
        </section>

        <section className="mt-14 grid gap-4 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
              <h2 className="label-mono">{v.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">{v.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 rounded-xl border border-neutral-800 bg-neutral-950/60 p-8 text-center">
          <h2 className="text-lg font-semibold">Want to join?</h2>
          <p className="mt-2 text-sm text-neutral-500">Create your page in about a minute.</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="rounded-lg bg-white px-4 py-2 font-mono text-xs font-medium text-black">
              Create your page
            </Link>
            <Link href="/open-source" className="rounded-lg border border-neutral-800 px-4 py-2 font-mono text-xs text-neutral-400 hover:border-neutral-600 hover:text-white">
              Read the code
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
