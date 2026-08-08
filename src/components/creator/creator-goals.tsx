"use client";

import { Clock3, Flag, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatAmount, formatDate, timeAgo } from "@/lib/utils";

export type PublicGoal = {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  deadline: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
  raised: number;
};

function GoalCard({ goal }: { goal: PublicGoal }) {
  const pct = Math.min(100, Math.round((goal.raised / goal.amount) * 100));

  return (
    <article className="oj-card rounded-xl border border-neutral-800 p-5">
      <div className="flex items-center gap-2">
        {goal.completed ? (
          <Flag className="h-4 w-4 text-emerald-400" />
        ) : (
          <Target className="h-4 w-4 text-neutral-500" />
        )}
        <h3 className="oj-page-text font-semibold tracking-tight">{goal.title}</h3>
      </div>

      {goal.description && <p className="mt-2 text-sm leading-relaxed text-neutral-500">{goal.description}</p>}

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between font-mono text-xs text-neutral-500">
          <span>
            <strong className="oj-page-text">{formatAmount(goal.raised)}</strong> of {formatAmount(goal.amount)}
          </span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      <p className="mt-3 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-600">
        <Clock3 className="h-3 w-3" />
        {goal.completed
          ? `completed ${timeAgo(goal.completedAt ?? goal.createdAt)}`
          : goal.deadline
            ? `by ${formatDate(goal.deadline)}`
            : `started ${timeAgo(goal.createdAt)}`}
      </p>
    </article>
  );
}

export function GoalList({ goals }: { goals: PublicGoal[] }) {
  if (goals.length === 0) return null;
  return (
    <section>
      <h2 className="label-mono oj-accent-text mb-4">Funding goals</h2>
      <div className="space-y-3">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </section>
  );
}
