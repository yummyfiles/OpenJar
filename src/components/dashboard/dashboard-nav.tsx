"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, HeartHandshake, Users, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/content", label: "Content", icon: FileText },
  { href: "/dashboard/donations", label: "Donations", icon: HeartHandshake },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-wrap items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-950/60 p-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs uppercase tracking-wider transition-colors",
              active ? "bg-white text-black" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
