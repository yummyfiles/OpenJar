import Link from "next/link";
import { Target } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { formatAmountShort } from "@/lib/utils";
import { Section } from "./section";
import { SectionHeader } from "./featured";

export function FundingGoals({
  goals
}: {
  goals: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
    raised: number;
    deadline: Date | null;
    creator: {
      id: string;
      username: string | null;
      displayName: string | null;
      name: string;
      image: string | null;
      verified: boolean;
    };
  }[];
}) {
  if (goals.length === 0) return null;

  return (
    <Section className="border-t border-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="funding goals" title="Goals in progress" href="/discover?tab=goals" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.raised / goal.amount) * 100));
            const handle = goal.creator.username ?? goal.creator.id;
            return (
              <Link
                key={goal.id}
                href={`/${handle}`}
                className="group flex flex-col rounded-xl border border-neutral-800 bg-neutral-950/60 p-5 transition-all hover:border-neutral-600 hover:shadow-card-hover"
              >
                <div className="flex items-center gap-2 text-neutral-400">
                  <Target className="h-4 w-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">{goal.title}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Avatar src={goal.creator.image} alt={goal.creator.displayName ?? goal.creator.name} size="sm" />
                  <span className="text-sm text-neutral-300">{goal.creator.displayName ?? goal.creator.name}</span>
                </div>
                <div className="mt-4 flex items-baseline justify-between font-mono text-sm">
                  <span className="text-white">{formatAmountShort(goal.raised)}</span>
                  <span className="text-neutral-500">of {formatAmountShort(goal.amount)}</span>
                </div>
                <Progress value={pct} className="mt-3" />
                <span className="mt-2 font-mono text-xs text-neutral-500">{pct}% funded</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
