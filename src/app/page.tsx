import Link from "next/link";
import { Megaphone } from "lucide-react";
import { getHomepageData } from "@/server/services/creators";
import { Hero } from "@/components/home/hero";
import { FAQ } from "@/components/home/faq";
import { CTA } from "@/components/home/cta";

// fetched at request time so featured/new sections stay fresh
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // if the db is briefly unavailable, render the shell rather than a 500
  const data = await getHomepageData().catch(() => null);

  return (
    <>
      {data?.announcement && (
        <div className="border-b border-neutral-900 bg-neutral-950/80">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
            <Megaphone className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
            <p className="truncate text-sm text-neutral-300">
              <Link href="/about" className="underline-offset-4 hover:underline">
                {data.announcement.title}
              </Link>
              <span className="ml-2 hidden text-neutral-500 sm:inline">— {data.announcement.content.slice(0, 120)}</span>
            </p>
          </div>
        </div>
      )}

      <Hero />

      <FAQ />

      <CTA />
    </>
  );
}
