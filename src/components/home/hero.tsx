import Link from "next/link";
import { ArrowRight } from "lucide-react";

const statNumbers = [
  ["100%", "open source"],
  ["$0", "platform fee"],
  ["0", "lock-in"],
  ["∞", "creators"]
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-900">
      <div className="bg-dots absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
        <p className="label-mono mb-6 animate-fade-in">open support · open creators · open source</p>

        <h1 className="max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
          <span className="font-mono">Open</span> support for{" "}
          <span className="font-mono">open</span> creators.
        </h1>

        <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-neutral-400">
          Support developers, artists, musicians, writers, and creators building amazing things. No fees,
          no middlemen, no lock-in.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-white px-8 text-base font-medium text-black transition-colors hover:bg-neutral-300"
          >
            Create Your Page <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/discover"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-neutral-800 px-8 text-base font-medium text-white transition-colors hover:border-neutral-600 hover:bg-neutral-900"
          >
            Discover Creators
          </Link>
        </div>

        <dl className="mt-20 grid grid-cols-2 gap-8 border-t border-neutral-900 pt-10 sm:grid-cols-4">
          {statNumbers.map(([value, label]) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">{value}</dd>
              <dd className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
