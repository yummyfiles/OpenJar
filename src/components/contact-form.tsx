"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function ContactForm() {
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Failed to send");
      toast.success("Message sent. We'll get back to you.");
      setEmail("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
      <div>
        <Label htmlFor="email">Your email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2" />
      </div>
      <div className="mt-4">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" className="mt-2 h-40 resize-none" maxLength={4000} />
      </div>
      <Button type="submit" className="mt-4" disabled={busy || !email || message.trim().length < 5}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Send message
      </Button>
    </form>
  );
}
