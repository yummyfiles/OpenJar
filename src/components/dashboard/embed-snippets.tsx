"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmbedSnippets({ username }: { username: string }) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (!username) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <h2 className="label-mono">share &amp; embed</h2>
        <p className="mt-2 text-sm text-neutral-500">Set a username to get your embeddable donation button.</p>
      </div>
    );
  }

  const pageUrl = `${origin}/${username}`;
  const buttonUrl = `${origin}/api/v1/creators/${username}/button`;
  const widgetUrl = `${origin}/${username}/embed`;

  const snippets = [
    {
      id: "html",
      label: "HTML button",
      hint: "Websites, blogs, and email signatures",
      value: `<a href="${pageUrl}"><img src="${buttonUrl}" width="300" height="64" alt="Support me on OpenJar" /></a>`
    },
    {
      id: "markdown",
      label: "Markdown",
      hint: "GitHub READMEs, posts, and editors",
      value: `[![Support me on OpenJar](${buttonUrl})](${pageUrl})`
    },
    {
      id: "widget",
      label: "Widget iframe",
      hint: "Full donation widget for any site",
      value: `<iframe src="${widgetUrl}" width="360" height="640" style="border:0;" loading="lazy" title="Support me on OpenJar"></iframe>`
    }
  ];

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 1500);
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
      <h2 className="label-mono">share &amp; embed</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Add a donation button or widget to any website, README, or place that supports HTML or Markdown. The button
        works anywhere — the widget is the full support panel in an iframe.
      </p>

      <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
        <p className="label-mono text-[10px] text-neutral-500">preview</p>
        <a href={pageUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block">
          <Image
            src={buttonUrl}
            alt="Support me on OpenJar"
            width={300}
            height={64}
            unoptimized
            className="h-16 w-auto"
          />
        </a>
        <iframe
          src={widgetUrl}
          title="OpenJar donation widget"
          className="mt-4 h-[480px] w-full rounded-lg border border-neutral-800"
          loading="lazy"
        />
      </div>

      <div className="mt-4 space-y-3">
        {snippets.map((s) => (
          <div key={s.id} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium">{s.label}</p>
                <p className="text-xs text-neutral-500">{s.hint}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => copy(s.id, s.value)}>
                {copied === s.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === s.id ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="mt-2 max-h-28 overflow-auto rounded-md border border-neutral-800 bg-black p-3 font-mono text-[11px] leading-relaxed text-neutral-300">
              {s.value}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
