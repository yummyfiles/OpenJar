import { createHmac, timingSafeEqual } from "crypto";
import type {
  CreateCheckoutParams,
  PaymentIntent,
  PaymentProvider,
  WebhookEvent,
  PaymentProviderName
} from "../types";
import { registerProvider } from "../registry";

// Lemon Squeezy REST API implementation. We use their JSON:API endpoints
// directly rather than a client lib so the whole provider stays dependency-free.
//
// Checkouts reference pre-built variants:
//   - one-time donations: LEMONSQUEEZY_DEFAULT_VARIANT (should be pay-what-you-want)
//   - memberships:       LEMONSQUEEZY_MEMBERSHIP_VARIANT (monthly or yearly)
// Custom pricing is stored in checkout_data.custom so webhooks can attribute
// the payment to the right creator + donation.

const providerName: PaymentProviderName = "lemonsqueezy";
const API_BASE = "https://api.lemonsqueezy.com/v1";

function apiKey(): string | null {
  return process.env.LEMONSQUEEZY_API_KEY ?? null;
}

async function lsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("Lemon Squeezy is not configured (LEMONSQUEEZY_API_KEY missing)");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${key}`,
      ...init?.headers
    }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Lemon Squeezy API ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json() as Promise<T>;
}

export const lemonsqueezyProvider: PaymentProvider = {
  name: providerName,

  isConfigured() {
    return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID);
  },

  async createCheckout(params: CreateCheckoutParams): Promise<PaymentIntent> {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId =
      params.mode === "subscription"
        ? process.env.LEMONSQUEEZY_MEMBERSHIP_VARIANT
        : process.env.LEMONSQUEEZY_DEFAULT_VARIANT;
    if (!storeId || !variantId) {
      throw new Error("Lemon Squeezy checkout is not configured (variant ids missing)");
    }

    const res = await lsFetch<{ data: { id: string; attributes: { url: string } } }>("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            variant_id: Number(variantId),
            checkout_data: {
              email: params.customerEmail,
              custom: {
                creatorId: params.metadata.creatorId,
                donationId: params.metadata.donationId,
                kind: params.metadata.kind,
                tierId: params.metadata.tierId ?? "",
                interval: params.metadata.interval ?? (params.interval ?? ""),
                supporterId: params.metadata.supporterId ?? "",
                source: params.metadata.source
              }
            },
            product_options: {
              name: params.mode === "subscription" ? `Membership` : `One-time donation`,
              description: params.tierName ?? `Support on OpenJar`
            }
          },
          relationships: {
            store: { data: { type: "stores", id: String(storeId) } }
          }
        }
      })
    });

    return {
      id: String(res.data.id),
      checkoutUrl: res.data.attributes.url,
      clientSecret: null,
      provider: providerName,
      amount: params.amount,
      currency: params.currency,
      mode: params.mode,
      metadata: params.metadata
    };
  },

  async cancelSubscription({ providerRef }) {
    await lsFetch(`/subscriptions/${providerRef}/cancel`, { method: "POST" });
    return { ok: true };
  },

  async verifyWebhook(headers: Headers, rawBody: string): Promise<WebhookEvent[]> {
    const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    const signature = headers.get("x-signature");
    if (!secret || !signature) throw new Error("Lemon Squeezy webhook is not configured");

    const expected = createHmac("sha256", secret).update(rawBody).digest("base64");
    const provided = Buffer.from(signature);
    const expectedBuf = Buffer.from(expected);
    if (provided.length !== expectedBuf.length || !timingSafeEqual(provided, expectedBuf)) {
      throw new Error("Invalid Lemon Squeezy webhook signature");
    }

    const payload = JSON.parse(rawBody) as {
      meta: { event_name: string; custom_data?: Record<string, string> };
      data: {
        id: string;
        attributes: {
          user_email?: string;
          user_name?: string;
          status?: string;
          subtotal?: number;
          total?: number;
          currency?: string;
          renews_at?: string | null;
          ends_at?: string | null;
          cancelled?: boolean;
        };
      };
    };

    const custom = payload.meta.custom_data ?? {};
    const id = String(payload.data.id);
    const attrs = payload.data.attributes;
    const events: WebhookEvent[] = [];

    switch (payload.meta.event_name) {
      case "order_created": {
        const isSubscription = custom.kind === "membership";
        if (isSubscription) {
          // first payment of a membership — subscription_created follows,
          // but we still want the initial donation record
          events.push({
            type: "subscription.created",
            providerRef: id,
            subscriptionId: id,
            metadata: custom,
            currentPeriodEnd: attrs.renews_at ?? undefined,
            customerEmail: attrs.user_email
          });
        } else {
          events.push({
            type: "payment.succeeded",
            providerRef: id,
            amount: attrs.total ?? 0,
            currency: (attrs.currency ?? "usd").toLowerCase(),
            metadata: custom,
            customerEmail: attrs.user_email,
            customerName: attrs.user_name
          });
        }
        break;
      }
      case "order_refunded": {
        events.push({ type: "payment.refunded", providerRef: id, amount: attrs.total, currency: (attrs.currency ?? "usd").toLowerCase() });
        break;
      }
      case "subscription_created": {
        events.push({
          type: "subscription.created",
          providerRef: id,
          subscriptionId: id,
          metadata: custom,
          currentPeriodEnd: attrs.renews_at ?? undefined,
          customerEmail: attrs.user_email
        });
        break;
      }
      case "subscription_updated":
      case "subscription_resumed": {
        events.push({
          type: "subscription.updated",
          providerRef: id,
          subscriptionId: id,
          status: attrs.status === "active" || attrs.status === "on_trial" ? "active" : "paused",
          currentPeriodEnd: attrs.renews_at ?? undefined,
          cancelAt: attrs.cancelled ? (attrs.ends_at ?? null) : null,
          customerEmail: attrs.user_email
        });
        break;
      }
      case "subscription_cancelled":
      case "subscription_expired":
      case "subscription_paused": {
        events.push({ type: "subscription.cancelled", providerRef: id, subscriptionId: id, customerEmail: attrs.user_email });
        break;
      }
      default:
        break;
    }

    return events;
  }
};

registerProvider(lemonsqueezyProvider);
