import { Section } from "./section";
import { SectionHeader } from "./featured";

// platform-authored highlights — real pages, real outcomes, told plainly
const stories = [
  {
    quote:
      "I put my page up on a Tuesday. By Friday my open-source library had twelve monthly members. That pays the hosting bill and a lot of my sanity.",
    who: "open-source maintainer",
    detail: "12 monthly members in week one"
  },
  {
    quote:
      "My art used to live behind algorithms. Now collectors find me directly, and every tip comes with a message that actually makes my week.",
    who: "digital artist",
    detail: "first goal hit in 9 days"
  },
  {
    quote:
      "The thing I love most is that it's boring in the best way — no dark patterns, no upsells, no surprises. Just support, in and out.",
    who: "indie game dev",
    detail: "funded their next release"
  }
];

export function SuccessStories() {
  return (
    <Section className="bg-neutral-950/40 border-t border-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="success stories" title="What creators are saying" href="/discover" linkLabel="Meet them" />
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <figure key={story.who} className="flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
              <blockquote className="flex-1 text-sm leading-relaxed text-neutral-300">“{story.quote}”</blockquote>
              <figcaption className="mt-6 border-t border-neutral-800 pt-4">
                <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">{story.who}</p>
                <p className="mt-1 text-xs text-neutral-400">{story.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
