import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default: "border border-neutral-800 text-neutral-400",
        accent: "bg-white text-black",
        success: "border border-emerald-900 text-emerald-400",
        warning: "border border-amber-900 text-amber-400",
        danger: "border border-red-900 text-red-400"
      }
    },
    defaultVariants: { variant: "default" }
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
