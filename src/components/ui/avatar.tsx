import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
}

const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16", xl: "h-24 w-24" };

export function Avatar({ src, alt, size = "md", ring, className, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-neutral-900",
        sizes[size],
        ring && "ring-2 ring-neutral-700",
        className
      )}
      {...props}
    >
      {src ? (
        <Image src={src} alt={alt ?? "avatar"} fill className="object-cover" sizes="96px" unoptimized />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-neutral-600">
          <UserRound className="h-1/2 w-1/2" />
        </div>
      )}
    </div>
  );
}
