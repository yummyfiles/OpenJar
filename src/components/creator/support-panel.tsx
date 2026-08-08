"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Heart, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";
import { formatAmountShort, cn } from "@/lib/utils";
import { QUICK_DONATION_AMOUNTS } from "@/lib/constants";
import { useSession } from "@/lib/auth-client";

type Tier = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  perks: string[];
};

export function SupportPanel({
  username,
  tiers,
  minDonation,
  allowAnonymous,
  allowMessages,
  embedded = false
}: {
  username: string;
  tiers: Tier[];
  minDonation: number;
  allowAnonymous: boolean;
  allowMessages: boolean;
  embedded?: boolean;
}) {
  const go = (url: string) => {
    const target = embedded ? window.top : window;
    (target ?? window).location.href = url;
  };
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [mode, setMode] = React.useState<"one_time" | "membership">("one_time");
  const [amount, setAmount] = React.useState("500");
  const [customAmount, setCustomAmount] = React.useState("");
  const [custom, setCustom] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [anonymous, setAnonymous] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [activeTierId, setActiveTierId] = React.useState<string | null>(tiers[0]?.id ?? null);

  React.useEffect(() => {
    if (searchParams.get("donation") === "success") {
      toast.success("Thank you for your support!");
    }
  }, [searchParams]);

  const amountValue = custom ? Math.max(Number(customAmount) || 0, 0) : Number(amount) || 0;
  const amountCents = Math.round(amountValue * 100);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amountCents || amountCents < minDonation) {
      toast.error(`Minimum donation is ${formatAmountShort(minDonation)}`);
      return;
    }
    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        amount: amountCents,
        currency: "usd",
        kind: mode,
        message: message.trim() || undefined,
        anonymous: anonymous && allowAnonymous
      };
      if (mode === "membership") {
        body.tierId = activeTierId;
        body.interval = "month";
        if (!session?.user) {
          go(`/login?next=/${username}`);
          return;
        }
      }

      const res = await fetch(`/api/v1/creators/${username}/donations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Could not start checkout");

      const intent = json.data;
      if (intent.checkoutUrl) {
        go(intent.checkoutUrl);
      } else {
        toast.info("This creator has not connected a payment processor yet — check back soon.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
      <div className="flex items-center justify-between">
        <h2 className="label-mono">Support</h2>
        <Heart className="h-4 w-4 text-neutral-500" />
      </div>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "one_time" | "membership")} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one_time">One-time</TabsTrigger>
          <TabsTrigger value="membership" disabled={tiers.length === 0}>
            Memberships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="one_time" className="mt-4">
          <div className="grid grid-cols-3 gap-2">
            {QUICK_DONATION_AMOUNTS.map((cents) => {
              const dollars = cents / 100;
              const active = !custom && Number(amount) === cents;
              return (
                <button
                  key={cents}
                  type="button"
                  onClick={() => {
                    setAmount(String(cents));
                    setCustom(false);
                  }}
                  className={cn(
                    "rounded-md border px-2 py-2 font-mono text-sm transition-colors",
                    active ? "border-white bg-white text-black" : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
                  )}
                >
                  ${dollars}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCustom(true)}
              className={cn(
                "rounded-md border px-2 py-2 font-mono text-sm transition-colors",
                custom ? "border-white bg-white text-black" : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
              )}
            >
              Custom
            </button>
          </div>
          {custom && (
            <div className="mt-3">
              <Label htmlFor="custom-amount" className="sr-only">
                Custom amount
              </Label>
              <Input
                id="custom-amount"
                type="number"
                min={minDonation / 100}
                step="1"
                placeholder="25"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="membership" className="mt-4 space-y-2">
          {tiers.map((tier) => {
            const active = activeTierId === tier.id;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setActiveTierId(tier.id)}
                className={cn(
                  "w-full rounded-md border p-3 text-left transition-colors",
                  active ? "border-white" : "border-neutral-800 hover:border-neutral-600"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tier.name}</span>
                  <span className="font-mono text-sm text-neutral-300">
                    {formatAmountShort(tier.price, tier.currency)}/mo
                  </span>
                </div>
                {tier.description && <p className="mt-1 text-xs text-neutral-500">{tier.description}</p>}
                {tier.perks.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {tier.perks.slice(0, 3).map((perk) => (
                      <li key={perk} className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <span className="text-neutral-700">·</span> {perk}
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </TabsContent>
      </Tabs>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {(allowMessages || mode === "membership") && (
          <div>
            <Label htmlFor="message">Message {allowMessages ? "(optional)" : ""}</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              placeholder="Say something nice…"
              className="mt-1.5 h-20 resize-none"
            />
          </div>
        )}

        {allowAnonymous && mode === "one_time" && (
          <div className="flex items-center justify-between">
            <Label htmlFor="anon">Donate anonymously</Label>
            <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full" size="lg">
          {busy ? <Spinner /> : <Heart className="animate-heartbeat h-4 w-4" />}
          {mode === "membership"
            ? `Join ${tiers.find((t) => t.id === activeTierId)?.name ?? "membership"}`
            : `Support ${formatAmountShort(amountCents)}`}
        </Button>

        {mode === "membership" && !session?.user && (
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Lock className="h-3 w-3" /> You&apos;ll sign in to start a membership.
          </p>
        )}
      </form>

      <Separator className="my-5" />
      <p className="label-mono text-[10px] text-neutral-600">Powered by OpenJar · free & open source</p>
    </div>
  );
}
