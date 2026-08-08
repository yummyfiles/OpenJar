"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, HeartHandshake, Users, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
  { href: "/settings", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/settings/content", label: "Content", icon: FileText },
  { href: "/settings/donations", label: "Donations", icon: HeartHandshake },
  { href: "/settings/subscribers", label: "Subscribers", icon: Users },
  { href: "/settings/settings", label: "Settings", icon: Settings }
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors",
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
