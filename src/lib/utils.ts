import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function randomId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

// minor units -> "1,234"
export function formatAmount(amount: number, currency = "usd"): string {
  const [major, minor = "00"] = (amount / 100).toFixed(2).split(".");
  const formatted = new Intl.NumberFormat("en-US").format(Number(major));
  const sym = CURRENCY_SYMBOLS[currency.toLowerCase()] ?? "$";
  if (minor === "00") return `${sym}${formatted}`;
  return `${sym}${formatted}.${minor}`;
}

// minor units -> "$12.50 /mo"
export function formatAmountShort(amount: number, currency = "usd"): string {
  const value = amount / 100;
  const sym = CURRENCY_SYMBOLS[currency.toLowerCase()] ?? "$";
  if (Number.isInteger(value)) return `${sym}${value}`;
  return `${sym}${value.toFixed(2)}`;
}

export function compactNumber(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

export function timeAgo(date: Date | string | number): string {
  const d = new Date(date);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"]
  ];
  let prev = seconds;
  for (const [size, unit] of units) {
    if (prev < size) {
      const v = Math.floor(prev);
      return v <= 0 ? "just now" : `${v} ${unit}${v === 1 ? "" : "s"} ago`;
    }
    prev = prev / size;
  }
  return "a while ago";
}

// "Mai" returns the 7-char month key used for monthly aggregations
export function monthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7); // 2026-08
}

export function formatDate(date: Date | string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...opts
  }).format(new Date(date));
}

export function absoluteUrl(path: string): string {
  const base = process.env.BASE_URL ?? "http://localhost:3000";
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

// marks a creator page url
export function creatorUrl(username: string): string {
  return `/${username}`;
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9_]{3,32}$/.test(username);
}

export function maskKey(key: string): string {
  if (key.length <= 10) return "****";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
  cad: "C$",
  aud: "A$",
  nzd: "NZ$",
  jpy: "¥",
  inr: "₹",
  chf: "CHF",
  sek: "kr",
  dkk: "kr",
  nok: "kr",
  pln: "zł",
  brl: "R$"
};

export function cn_usernameDisplay(name?: string | null, username?: string | null): string {
  return name || username || "anonymous";
}
