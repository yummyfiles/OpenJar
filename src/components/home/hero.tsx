"use client";

import Link from "next/link";
import { ArrowRight, CircleDollarSign, Coins, Heart } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { CSSProperties } from "react";
import { EASE } from "@/components/motion";

const statNumbers = [
  ["100%", "open source"],
  ["$0", "platform fee"],
  ["0", "lock-in"],
  ["∞", "creators"]
];

// deterministic so SSR and client render identically
const PARTICLES: {
  left: number;
  size: number;
  duration: number;
  delay: number;
  sway: number;
  opacity: number;
  type: "coin" | "heart" | "dollar";
}[] = [
  { left: 8, size: 18, duration: 17, delay: -2, sway: 30, opacity: 0.45, type: "coin" },
  { left: 16, size: 14, duration: 21, delay: -9, sway: -24, opacity: 0.35, type: "heart" },
  { left: 27, size: 20, duration: 15, delay: -5, sway: 20, opacity: 0.4, type: "dollar" },
  { left: 38, size: 16, duration: 19, delay: -12, sway: -32, opacity: 0.45, type: "coin" },
  { left: 49, size: 13, duration: 23, delay: -3, sway: 26, opacity: 0.3, type: "heart" },
  { left: 58, size: 19, duration: 16, delay: -7, sway: -22, opacity: 0.4, type: "coin" },
  { left: 67, size: 14, duration: 20, delay: -11, sway: 28, opacity: 0.35, type: "heart" },
  { left: 75, size: 18, duration: 18, delay: -1, sway: -26, opacity: 0.4, type: "dollar" },
  { left: 84, size: 15, duration: 22, delay: -8, sway: 24, opacity: 0.3, type: "coin" },
  { left: 92, size: 17, duration: 14, delay: -4, sway: -30, opacity: 0.45, type: "heart" }
];

const PARTICLE_ICONS = { coin: Coins, heart: Heart, dollar: CircleDollarSign } as const;

function enter(delay: number) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease: EASE }
  };
}

export function Hero() {
  const { scrollYProgress } = useScroll();
  const bgY = useTransform(scrollYProgress, [0, 0.5], [0, 160]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0.15]);

  return (
    <section className="relative overflow-hidden border-b border-neutral-900">
      <motion.div aria-hidden style={{ y: bgY, opacity: bgOpacity }} className="absolute inset-0">
        <div className="bg-dots absolute inset-0" />
        <div className="aurora-blob -left-24 -top-32 h-[420px] w-[420px] bg-lime-400/10" />
        <div className="aurora-blob -right-20 top-6 h-[380px] w-[380px] bg-sky-400/10" />
        <div className="aurora-blob -bottom-40 left-1/3 h-[460px] w-[460px] bg-white/5" />

        <div className="absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => {
            const Icon = PARTICLE_ICONS[p.type];
            const style: CSSProperties = {
              left: `${p.left}%`,
              color: p.type === "heart" ? "#a3e635" : p.type === "coin" ? "#d4d4d4" : "#fafafa",
              "--p-duration": `${p.duration}s`,
              "--p-delay": `${p.delay}s`,
              "--p-sway": `${p.sway}px`,
              "--p-opacity": p.opacity
            } as CSSProperties;
            return (
              <div key={i} className="float-particle" style={style}>
                <Icon style={{ width: p.size, height: p.size }} />
              </div>
            );
          })}
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
        <motion.p {...enter(0.05)} className="label-mono mb-6">
          open support · open creators · open source
        </motion.p>

        <motion.h1
          {...enter(0.15)}
          className="max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
        >
          <span className="font-mono">Open</span> support for{" "}
          <span className="font-mono">open</span> creators.
        </motion.h1>

        <motion.p {...enter(0.25)} className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-neutral-400">
          Support developers, artists, musicians, writers, and creators building amazing things. No fees,
          no middlemen, no lock-in.
        </motion.p>

        <motion.div {...enter(0.35)} className="mt-10 flex flex-wrap items-center gap-3">
          <Link
            href="/signup"
            className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-8 text-base font-medium text-black transition-colors hover:bg-neutral-300"
          >
            Create Your Page
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/discover"
            className="btn-shine inline-flex h-11 items-center gap-2 rounded-md border border-neutral-800 px-8 text-base font-medium text-white transition-colors hover:border-neutral-600 hover:bg-neutral-900"
          >
            Discover Creators
          </Link>
        </motion.div>

        <dl className="mt-20 grid grid-cols-2 gap-8 border-t border-neutral-900 pt-10 sm:grid-cols-4">
          {statNumbers.map(([value, label], i) => (
            <motion.div key={label} {...enter(0.45 + i * 0.08)}>
              <dt className="sr-only">{label}</dt>
              <dd className="font-mono text-3xl font-bold tracking-tight sm:text-4xl">{value}</dd>
              <dd className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-neutral-500">{label}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
