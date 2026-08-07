export const APP_NAME = "OpenJar";
export const APP_TAGLINE = "Open support for open creators.";
export const APP_DESCRIPTION =
  "Support developers, artists, musicians, writers, and creators building amazing things.";

export const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// usernames that clash with app routes
export const RESERVED_USERNAMES = [
  "about",
  "admin",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "careers",
  "creator",
  "dashboard",
  "discover",
  "docs",
  "donate",
  "explore",
  "faq",
  "feed",
  "features",
  "forgot-password",
  "guidelines",
  "help",
  "home",
  "login",
  "logout",
  "new",
  "notifications",
  "onboarding",
  "openjar",
  "open-source",
  "pricing",
  "privacy",
  "profile",
  "reset-password",
  "search",
  "settings",
  "sign-in",
  "sign-up",
  "signin",
  "signup",
  "support",
  "terms",
  "trending",
  "verify",
  "www"
];

export const DEFAULT_AVATAR = "https://avatars.githubusercontent.com/"; // fallback handled per-user

// categories used across discovery + creator onboarding
export const CREATOR_CATEGORIES = [
  { id: "open-source", label: "Open Source", icon: "code" },
  { id: "art", label: "Art", icon: "brush" },
  { id: "music", label: "Music", icon: "music" },
  { id: "writing", label: "Writing", icon: "pen" },
  { id: "design", label: "Design", icon: "layout" },
  { id: "video", label: "Video", icon: "clapperboard" },
  { id: "games", label: "Games", icon: "gamepad" },
  { id: "education", label: "Education", icon: "graduation-cap" },
  { id: "podcasts", label: "Podcasts", icon: "mic" },
  { id: "science", label: "Science", icon: "flask" },
  { id: "photography", label: "Photography", icon: "camera" },
  { id: "other", label: "Other", icon: "sparkles" }
] as const;

export const PROGRAMMING_LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "C",
  "C++",
  "C#",
  "Java",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "Zig",
  "Lua",
  "Haskell",
  "Elixir",
  "Scala",
  "Shell",
  "CSS",
  "HTML",
  "Dart"
];

// quick-pick donation amounts in minor units (usd cents)
export const QUICK_DONATION_AMOUNTS = [300, 500, 1000, 2500, 5000];

export const CURRENCIES = ["usd", "eur", "gbp", "cad", "aud", "jpy", "chf", "brl"];

export const MAX_BIO_LENGTH = 2000;
export const MAX_POST_LENGTH = 100_000;

// how often the github refresh is allowed per creator (seconds)
export const GITHUB_REFRESH_INTERVAL = 60 * 30;

export const HOME_FEATURED_COUNT = 6;
export const HOME_NEW_COUNT = 6;
export const HOME_TRENDING_PROJECTS_COUNT = 6;
export const DISCOVER_PAGE_SIZE = 18;

export const ADMIN_ROLES: string[] = ["admin", "moderator"] as const;

export const FAQ_ITEMS = [
  {
    q: "What is OpenJar?",
    a: "OpenJar is a free, open-source platform where anyone can support creators through one-time donations, monthly memberships, and project funding. No hidden fees, no lock-in, and no middlemen deciding what you can build."
  },
  {
    q: "How much does OpenJar charge?",
    a: "OpenJar is free for creators. We only pass through the standard payment processor fees charged by Stripe or Lemon Squeezy. When you reach higher volumes we may ask for optional tips to keep the lights on — never as a requirement."
  },
  {
    q: "Can I use it with my existing GitHub repos?",
    a: "Yes. Connect your GitHub account and OpenJar will display your repositories, stars, forks, languages, and contribution graph right on your page — automatically synced."
  },
  {
    q: "Can I switch payment providers later?",
    a: "Yes. Payments are built behind a provider abstraction. You can move between Stripe, Lemon Squeezy, and others without rewriting your page or losing your supporter history."
  },
  {
    q: "Is my data portable?",
    a: "Completely. You own your content and your supporters. Export anytime, and walk away whenever you want. OpenJar is MIT-licensed open source — you can even self-host it."
  },
  {
    q: "Do supporters need an account to donate?",
    a: "No. One-time donations can be made as a guest with just a card and an optional message. Memberships need an account so we can manage recurring billing."
  }
];
