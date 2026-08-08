// Page layout envelope stored on User.customLinks. Keeps a creator's
// drag-and-drop section order, custom link buttons, and color overrides
// without requiring a schema migration.

export type PageSectionId = "stats" | "links" | "goals" | "posts" | "projects" | "github" | "supporters";

export type PageLink = {
  id: string;
  label: string;
  url: string;
};

export type PageColors = {
  pageBg?: string;
  card?: string;
  text?: string;
  accent?: string;
  btnBg?: string;
  btnText?: string;
  border?: string;
};

export const COLOR_KEYS = [
  "pageBg",
  "card",
  "text",
  "accent",
  "btnBg",
  "btnText",
  "border"
] as const;

export type PageLayout = {
  links: PageLink[];
  layout: {
    sections: PageSectionId[];
    colors: PageColors;
  };
};

export const SECTION_IDS: PageSectionId[] = [
  "stats",
  "links",
  "goals",
  "posts",
  "projects",
  "github",
  "supporters"
];

export const DEFAULT_SECTIONS: PageSectionId[] = [
  "stats",
  "goals",
  "posts",
  "projects",
  "github",
  "supporters"
];

export const SECTION_META: Record<PageSectionId, { label: string; description: string }> = {
  stats: { label: "Support stats", description: "Monthly + all-time totals" },
  links: { label: "Custom links", description: "Your own link buttons" },
  goals: { label: "Funding goals", description: "Fundraising progress" },
  posts: { label: "Updates", description: "Recent posts" },
  projects: { label: "Projects", description: "Your projects" },
  github: { label: "GitHub", description: "Repos + contributions" },
  supporters: { label: "Recent supporters", description: "Latest supporters" }
};

const HEX = /^#[0-9a-fA-F]{6}$/;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function isSectionId(value: unknown): value is PageSectionId {
  return typeof value === "string" && (SECTION_IDS as readonly string[]).includes(value);
}

export function makeLinkId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `link-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function defaultLayout(): PageLayout {
  return {
    links: [],
    layout: { sections: [...DEFAULT_SECTIONS], colors: {} }
  };
}

export function parseLayout(raw: unknown): PageLayout {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return defaultLayout();

  const o = raw as Record<string, unknown>;
  const layoutObj =
    o.layout && typeof o.layout === "object" && !Array.isArray(o.layout)
      ? (o.layout as Record<string, unknown>)
      : {};

  let sections: PageSectionId[];
  if (Array.isArray(layoutObj.sections)) {
    const seen = new Set<PageSectionId>();
    for (const s of layoutObj.sections) {
      if (isSectionId(s)) seen.add(s);
    }
    sections = [...seen];
  } else {
    sections = [...DEFAULT_SECTIONS];
  }

  const links: PageLink[] = [];
  if (Array.isArray(o.links)) {
    o.links.forEach((l, i) => {
      if (!l || typeof l !== "object" || Array.isArray(l)) return;
      const item = l as Record<string, unknown>;
      const label = typeof item.label === "string" ? item.label.trim().slice(0, 60) : "";
      const url = typeof item.url === "string" ? item.url.trim().slice(0, 2048) : "";
      if (!label || !url) return;
      links.push({
        id: typeof item.id === "string" && item.id ? item.id : `link-${i}`,
        label,
        url
      });
    });
  }

  const colors: PageColors = {};
  const colorsObj =
    layoutObj.colors && typeof layoutObj.colors === "object" && !Array.isArray(layoutObj.colors)
      ? (layoutObj.colors as Record<string, unknown>)
      : {};
  for (const key of COLOR_KEYS) {
    if (isHexColor(colorsObj[key])) colors[key] = colorsObj[key];
  }

  return { links, layout: { sections, colors } };
}
