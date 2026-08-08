import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeUp } from "@/components/motion";

export function CTA() {
  return (
    <section className="border-t border-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <FadeUp className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/60 px-8 py-16 text-center sm:py-20">
          <div className="bg-dots absolute inset-0" aria-hidden />
          <div className="relative">
            <p className="label-mono mb-4">no fees · no lock-in · your page, your rules</p>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight sm:text-5xl">
              Start accepting support in minutes.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-neutral-400">
              Claim your name, add your projects, and let the people who love your work fund what comes next.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-white px-8 text-base font-medium text-black transition-colors hover:bg-neutral-300"
              >
                Create Your Page
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="btn-shine inline-flex h-11 items-center rounded-md border border-neutral-800 px-8 text-base font-medium text-white transition-colors hover:border-neutral-600 hover:bg-neutral-900"
              >
                Why OpenJar
              </Link>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
