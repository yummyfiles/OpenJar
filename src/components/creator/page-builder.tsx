"use client";

import * as React from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  Loader2,
  Palette,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SupportPanel } from "@/components/creator/support-panel";
import { RecentSupporters } from "@/components/creator/supporters";
import { SectionRenderer, type PageSnapshot } from "@/components/creator/page-sections";
import { SECTION_IDS, SECTION_META, makeLinkId } from "@/lib/page-layout";
import type { PageColors, PageLayout, PageLink, PageSectionId } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

type TabId = "sections" | "links" | "colors" | "images";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "sections", label: "Sections", icon: LayoutGrid },
  { id: "links", label: "Links", icon: Link2 },
  { id: "colors", label: "Colors", icon: Palette },
  { id: "images", label: "Photos", icon: ImageIcon }
];

const COLOR_ROWS: { key: keyof PageColors; label: string; hint: string; fallback: string }[] = [
  { key: "pageBg", label: "Page background", hint: "Behind the content", fallback: "#000000" },
  { key: "card", label: "Cards", hint: "Panels & cards", fallback: "#0a0a0a" },
  { key: "text", label: "Text", hint: "Headings & values", fallback: "#ffffff" },
  { key: "accent", label: "Accent", hint: "Section headings", fallback: "#a3e635" }
];

export function PageBuilder({
  snapshot,
  initialLayout,
  username
}: {
  snapshot: PageSnapshot;
  initialLayout: PageLayout;
  username: string;
}) {
  const [sections, setSections] = React.useState<PageSectionId[]>(initialLayout.layout.sections);
  const [links, setLinks] = React.useState<PageLink[]>(initialLayout.links);
  const [colors, setColors] = React.useState<PageColors>(initialLayout.layout.colors);
  const [tab, setTab] = React.useState<TabId | null>("sections");
  const [busy, setBusy] = React.useState(false);
  const [uploading, setUploading] = React.useState<"image" | "banner" | null>(null);

  const dirty =
    JSON.stringify(sections) !== JSON.stringify(initialLayout.layout.sections) ||
    JSON.stringify(links) !== JSON.stringify(initialLayout.links) ||
    JSON.stringify(colors) !== JSON.stringify(initialLayout.layout.colors);

  function toggleSection(id: PageSectionId) {
    setSections((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function updateLink(id: string, patch: Partial<PageLink>) {
    setLinks((list) => list.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLink(id: string) {
    setLinks((list) => list.filter((l) => l.id !== id));
  }

  function addLink() {
    setLinks((list) => [...list, { id: makeLinkId(), label: "", url: "" }]);
  }

  function setColor(key: keyof PageColors, value: string) {
    setColors((c) => ({ ...c, [key]: value }));
  }

  function resetColor(key: keyof PageColors) {
    setColors((c) => {
      const next = { ...c };
      delete next[key];
      return next;
    });
  }

  async function save() {
    const cleanLinks = links
      .filter((l) => l.label.trim() && l.url.trim())
      .map((l) => ({ id: l.id, label: l.label.trim(), url: l.url.trim() }));

    const cleanColors: PageColors = {};
    for (const key of Object.keys(colors) as (keyof PageColors)[]) {
      const value = colors[key];
      if (value && HEX.test(value)) cleanColors[key] = value.toLowerCase();
    }

    setBusy(true);
    try {
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customLinks: { links: cleanLinks, layout: { sections, colors: cleanColors } } })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not save your page");
      toast.success("Page saved");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save your page");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File, folder: string): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const res = await fetch("/api/v1/upload", { method: "POST", body: form });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message ?? "Upload failed");
    return json.data.url as string;
  }

  async function setPhoto(field: "image" | "banner", file: File) {
    setUploading(field);
    try {
      const url = await uploadImage(file, field === "image" ? "avatars" : "banners");
      const res = await fetch("/api/v1/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: url })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not update photo");
      toast.success(field === "image" ? "Profile photo updated" : "Banner updated");
      window.location.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
    }
  }

  const liveVars = {
    ...(colors.card ? { "--oj-card": colors.card } : {}),
    ...(colors.text ? { "--oj-text": colors.text } : {}),
    ...(colors.accent ? { "--oj-accent": colors.accent } : {})
  } as React.CSSProperties;

  return (
    <div style={{ ...liveVars, backgroundColor: colors.pageBg || "var(--oj-page-bg, transparent)" }} className="pb-56">
      <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
        <GripVertical className="h-3 w-3" />
        customize mode — drag cards to reorder, then save
      </p>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={setSections}
          className="min-w-0 space-y-12"
          style={{ listStyle: "none", margin: 0, padding: 0 }}
        >
          {sections.map((id) => (
            <EditableSection key={id} id={id} snapshot={snapshot} />
          ))}
        </Reorder.Group>

        <aside className="space-y-8">
          <div className="lg:sticky lg:top-20">
            <SupportPanel
              username={snapshot.username}
              tiers={snapshot.tiers}
              minDonation={snapshot.minDonation}
              allowAnonymous={snapshot.allowAnonymous}
              allowMessages={snapshot.allowMessages}
            />
            <Separator className="my-6" />
            <RecentSupporters donations={snapshot.summary.recentSupporters} />
          </div>
        </aside>
      </div>

      {/* floating builder toolbar */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-4">
        <div className="pointer-events-auto w-full max-w-2xl px-4">
          <div className="oj-card rounded-xl border border-neutral-800 p-3 shadow-2xl">
            {tab && (
              <div className="mb-3 border-b border-neutral-800 pb-3">
                {tab === "sections" && (
                  <div className="space-y-1.5">
                    <p className="label-mono mb-2 text-[10px]">show / hide sections</p>
                    {SECTION_IDS.map((id) => {
                      const active = sections.includes(id);
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleSection(id)}
                          className="flex w-full items-center justify-between gap-3 rounded-lg border border-neutral-800 px-3 py-2 text-left transition-colors hover:border-neutral-600"
                        >
                          <div>
                            <p className="text-sm">{SECTION_META[id].label}</p>
                            <p className="text-[11px] text-neutral-500">{SECTION_META[id].description}</p>
                          </div>
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                              active ? "border-white bg-white text-black" : "border-neutral-700 text-transparent"
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </button>
                      );
                    })}
                    <p className="pt-1 text-[11px] text-neutral-600">Drag the cards on the page to reorder them.</p>
                  </div>
                )}

                {tab === "links" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="label-mono text-[10px]">custom link buttons</p>
                      <button
                        type="button"
                        onClick={addLink}
                        className="inline-flex items-center gap-1 text-xs text-neutral-300 transition-colors hover:text-white"
                      >
                        <Plus className="h-3.5 w-3.5" /> add link
                      </button>
                    </div>
                    {links.length === 0 && (
                      <p className="text-xs text-neutral-500">No links yet — add buttons that point anywhere.</p>
                    )}
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center gap-2 rounded-lg border border-neutral-800 p-2">
                        <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_2fr]">
                          <Input
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => updateLink(link.id, { label: e.target.value })}
                            maxLength={60}
                            className="h-8"
                          />
                          <Input
                            placeholder="https://…"
                            value={link.url}
                            onChange={(e) => updateLink(link.id, { url: e.target.value })}
                            maxLength={2048}
                            className="h-8 font-mono"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(link.id)}
                          title="Remove link"
                          className="text-neutral-500 transition-colors hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "colors" && (
                  <div className="space-y-2">
                    <p className="label-mono mb-2 text-[10px]">colors</p>
                    {COLOR_ROWS.map((row) => {
                      const value = colors[row.key] ?? "";
                      const valid = HEX.test(value);
                      return (
                        <div key={row.key} className="flex items-center gap-3 rounded-lg border border-neutral-800 p-2">
                          <input
                            type="color"
                            value={valid ? value : row.fallback}
                            onChange={(e) => setColor(row.key, e.target.value)}
                            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-neutral-800 bg-transparent"
                            aria-label={row.label}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm leading-none">{row.label}</p>
                            <p className="mt-0.5 text-[11px] text-neutral-500">{row.hint}</p>
                          </div>
                          <input
                            value={value}
                            onChange={(e) => setColor(row.key, e.target.value)}
                            placeholder={row.fallback}
                            maxLength={7}
                            className="h-8 w-24 rounded-md border border-neutral-800 bg-neutral-950/50 px-2 font-mono text-xs text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => resetColor(row.key)}
                            title="Reset to default"
                            className="text-neutral-500 transition-colors hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    <p className="pt-1 text-[11px] text-neutral-600">Leave a field empty to use the default theme.</p>
                  </div>
                )}

                {tab === "images" && (
                  <div className="space-y-3">
                    <p className="label-mono text-[10px]">photos</p>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={snapshot.image} alt="profile" size="lg" />
                        <div>
                          <p className="text-sm">Profile photo</p>
                          <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-600">
                            {uploading === "image" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ImageIcon className="h-3.5 w-3.5" />
                            )}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPhoto("image", file);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        {snapshot.banner ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={snapshot.banner}
                            alt="banner"
                            className="h-16 w-full rounded-lg border border-neutral-800 object-cover"
                          />
                        ) : (
                          <div className="flex h-16 w-full items-center justify-center rounded-lg border border-dashed border-neutral-800 text-[11px] text-neutral-600">
                            no banner yet
                          </div>
                        )}
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <p className="text-sm">Page banner</p>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-neutral-800 px-3 py-1 text-xs text-neutral-300 transition-colors hover:border-neutral-600">
                            {uploading === "banner" ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ImageIcon className="h-3.5 w-3.5" />
                            )}
                            Upload
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setPhoto("banner", file);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1">
                {TABS.map((t) => {
                  const TabIcon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTab(tab === t.id ? null : t.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                        tab === t.id ? "bg-white text-black" : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                      )}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/${username}`} target="_blank" className="text-xs text-neutral-500 transition-colors hover:text-white">
                  preview
                </Link>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/${username}`}>Exit</Link>
                </Button>
                <Button size="sm" onClick={save} disabled={busy || !dirty}>
                  {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableSection({ id, snapshot }: { id: PageSectionId; snapshot: PageSnapshot }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} className="relative list-none">
      <div className="relative">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          title="Drag to reorder"
          className="absolute right-0 top-0 z-10 flex items-center rounded-md border border-neutral-800 bg-neutral-950/90 px-1.5 py-1 text-neutral-500 transition-colors hover:border-neutral-600 hover:text-white"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <SectionRenderer section={id} snapshot={snapshot} editable />
      </div>
    </Reorder.Item>
  );
}
