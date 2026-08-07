import * as React from "react";
import { cn } from "@/lib/utils";

// minimal progress bar; used for goals, monthly targets, setup completion
export function Progress({
  value,
  className,
  indicatorClassName
}: {
  value: number; // 0..100
  className?: string;
  indicatorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-900", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full bg-neutral-200 transition-all duration-500", indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
