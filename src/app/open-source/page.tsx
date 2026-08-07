import Link from "next/link";
import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";

export const metadata: Metadata = { title: "Open Source" };

const PRINCIPLES = [
  {
    title: "MIT licensed",
    body: "The entire platform is MIT licensed. You can read it, fork it, self-host it, or extend it. No contributor license agreements, no proprietary core."
  },
  {
    title: "Self-hostable",
    body: "OpenJar runs on standard tools: Next.js, PostgreSQL, Prisma, and Better Auth. Point it at your own database and you're running your own instance."
  },
  {
    title: "Portable by design",
    body: "Your data isn't locked in. Export supporters, posts, and settings whenever you want. Walk away, come back, move servers — it's your data."
  }
];

export default function OpenSourcePage() {
  return (
    <>
      <StaticHeader
        eyebrow="open source"
        title="Built in the open"
        description="OpenJar is free software. Here's what that means in practice."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
              <h2 className="label-mono">{p.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">{p.body}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-xl border border-neutral-800 bg-neutral-950/60 p-8">
          <h2 className="text-lg font-semibold">Tech stack</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Next.js 15", "React 19", "TypeScript", "PostgreSQL", "Prisma", "Better Auth", "Tailwind CSS", "Framer Motion", "Zod"].map((t) => (
              <span key={t} className="rounded border border-neutral-800 px-2.5 py-1 font-mono text-xs text-neutral-400">
                {t}
              </span>
            ))}
          </div>
          <p className="mt-5 text-sm leading-relaxed text-neutral-500">
            Contributing is welcome: file issues, open pull requests, translate the UI, or self-host and report what breaks.
            The code lives on GitHub and the API is documented in the{" "}
            <Link href="/docs/api" className="text-white underline-offset-4 hover:underline">
              API docs
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
