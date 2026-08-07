import { FAQ_ITEMS } from "@/lib/constants";
import { Section } from "./section";
import { SectionHeader } from "./featured";

export function FAQ() {
  return (
    <Section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <SectionHeader eyebrow="faq" title="Questions, answered" href="/faq" linkLabel="Read more" />
      <div className="space-y-2">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-neutral-800 bg-neutral-950/60 px-5 py-4 transition-colors open:border-neutral-700"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-neutral-200 [&::-webkit-details-marker]:hidden">
              {item.q}
              <span className="font-mono text-neutral-500 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}
