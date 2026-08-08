"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, LayoutDashboard, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown";

const navLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/discover?tab=projects", label: "Projects" },
  { href: "/about", label: "About" }
];

function Logo() {
  return (
    <Link href="/" aria-label="OpenJar home" className="flex items-center">
      <Image
        src="/openjar-logo.png"
        alt="OpenJar"
        width={92}
        height={42}
        className="h-[42px] w-auto"
        priority
      />
    </Link>
  );
}

function UserMenu() {
  const { data: session } = useSession();
  const user = session?.user;

  if (!user) return null;

  const username = (user.username as string | undefined) ?? (user.displayName as string | undefined);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full focus-visible:outline-none" aria-label="Open account menu">
          <Avatar src={(user.image as string | undefined) ?? null} alt={user.name} size="sm" ring />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {user.name}
          <span className="block truncate font-mono text-[10px] normal-case text-neutral-500">@{username ?? "no-username"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {username && (
          <DropdownMenuItem asChild>
            <Link href={`/${username}`}>
              <UserRound /> Your page
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        {user.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">Admin</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            window.location.href = "/";
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const user = session?.user;
  const username = (user?.username as string | undefined) ?? (user?.displayName as string | undefined);

  if (pathname.includes("/embed")) return null;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-900 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm text-neutral-400 transition-colors hover:text-white",
                  pathname === link.href.split("?")[0] && "text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/discover" aria-label="Search creators and projects">
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" aria-label="Notifications">
                <Link href="/dashboard/notifications">
                  <Bell className="h-4 w-4" />
                </Link>
              </Button>
              <UserMenu />
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Create your page</Link>
              </Button>
            </div>
          )}

          <button
            className="rounded-md p-2 text-neutral-400 hover:text-white md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-neutral-900 px-4 py-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {username && (
                  <Link href={`/${username}`} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                    Your page
                  </Link>
                )}
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-900">
                  Create your page
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
