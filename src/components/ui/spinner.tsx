import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />;
}

export function PageLoader({ label = "loading" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-32 text-neutral-500">
      <Spinner className="h-6 w-6" />
      <span className="font-mono text-xs uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-900",
        className
      )}
    />
  );
}
