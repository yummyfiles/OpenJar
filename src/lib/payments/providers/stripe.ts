import Stripe from "stripe";
import type {
  CreateCheckoutParams,
  PaymentIntent,
  PaymentProvider,
  WebhookEvent,
  PaymentProviderName
} from "../types";
import { registerProvider } from "../registry";

const providerName: PaymentProviderName = "stripe";

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

function client(): Stripe | null {
  return getStripe();
}

// ---------------------------------------------------------------------------
// Stripe Connect Express — creator onboarding & payouts
// ---------------------------------------------------------------------------

export function isConnectConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Creates (or returns) the platform-side Express account for a creator. */
export async function ensureConnectAccount(input: { email: string; name: string; url?: string }): Promise<{
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  const stripe = client();
  if (!stripe) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY is missing)");

  const account = await stripe.accounts.create({
    type: "express",
    email: input.email,
    business_profile: {
      name: input.name.slice(0, 120) || undefined,
      url: input.url || undefined
    }
  });

  return {
    accountId: account.id,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled
  };
}

export async function getConnectAccount(accountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}> {
  const stripe = client();
  if (!stripe) throw new Error("Stripe is not configured");
  const account = await stripe.accounts.retrieve(accountId);
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled
  };
}

/**
 * Returns a Stripe-hosted onboarding/dashboard link for a connected account.
 * `mode: "account_onboarding"` for first-time setup, `"account_update"` to manage.
 */
export async function createAccountLink(accountId: string, mode: "account_onboarding" | "account_update", origin: string): Promise<string> {
  const stripe = client();
  if (!stripe) throw new Error("Stripe is not configured");
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${origin}/settings/settings?stripe=refresh`,
    return_url: `${origin}/settings/settings?stripe=done`,
    type: mode
  });
  return link.url;
}

export const stripeProvider: PaymentProvider = {
  name: providerName,

  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  },

  async createCheckout(params: CreateCheckoutParams): Promise<PaymentIntent> {
    const stripe = client();
    if (!stripe) throw new Error("Stripe is not configured (STRIPE_SECRET_KEY is missing)");

    const isSubscription = params.mode === "subscription";
    const connectAccountId = params.connectAccountId;
    const platformFee = params.platformFee ?? 0;

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = isSubscription
      ? [
          {
            price_data: {
              currency: params.currency,
              product_data: {
                name: params.tierName ?? "Membership",
                metadata: { creatorId: params.metadata.creatorId }
              },
              unit_amount: params.amount,
              recurring: { interval: params.interval ?? "month" }
            },
            quantity: 1
          }
        ]
      : [
          {
            price_data: {
              currency: params.currency,
              product_data: { name: `One-time donation` },
              unit_amount: params.amount
            },
            quantity: 1
          }
        ];

    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      line_items: lineItems,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.customerEmail,
      // keep every field short — stripe caps metadata values at 500 chars
      metadata: {
        creatorId: params.metadata.creatorId,
        donationId: params.metadata.donationId,
        kind: params.metadata.kind,
        tierId: params.metadata.tierId ?? "",
        source: params.metadata.source,
        supporterId: params.metadata.supporterId ?? ""
      },
      // one-time donations can be anonymous from the get go
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      ...(isSubscription
        ? {
            subscription_data: {
              metadata: { donationId: params.metadata.donationId },
              ...(connectAccountId
                ? { transfer_data: { destination: connectAccountId }, application_fee_percent: 0 }
                : {})
            }
          }
        : connectAccountId
          ? {
              payment_intent_data: {
                transfer_data: { destination: connectAccountId },
                application_fee_amount: platformFee
              }
            }
          : {})
    });

    return {
      id: session.id,
      checkoutUrl: session.url,
      clientSecret: session.client_secret ?? null,
      provider: providerName,
      amount: params.amount,
      currency: params.currency,
      mode: params.mode,
      metadata: params.metadata
    };
  },

  async cancelSubscription({ providerRef }) {
    const stripe = client();
    if (!stripe) throw new Error("Stripe is not configured");
    await stripe.subscriptions.cancel(providerRef);
    return { ok: true };
  },

  async verifyWebhook(headers: Headers, rawBody: string): Promise<WebhookEvent[]> {
    const stripe = client();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !secret) throw new Error("Stripe webhook is not configured");
    if (!headers.get("stripe-signature")) throw new Error("Missing stripe-signature header");

    const event = stripe.webhooks.constructEvent(rawBody, headers.get("stripe-signature")!, secret);
    const events: WebhookEvent[] = [];

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = (session.metadata ?? {}) as Record<string, string>;
        if (session.mode === "subscription") {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          events.push({
            type: "subscription.created",
            providerRef: sub.id,
            subscriptionId: sub.id,
            metadata: { ...(sub.metadata ?? {}), ...meta },
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined,
            customerEmail: session.customer_details?.email ?? undefined
          });
        } else {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          events.push({
            type: "payment.succeeded",
            providerRef: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            metadata: meta,
            customerEmail: session.customer_details?.email ?? undefined,
            customerName: session.customer_details?.name ?? undefined
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
          events.push({
            type: "subscription.updated",
            providerRef: sub.id,
            subscriptionId: sub.id,
            status: "active",
            currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined,
            cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
            customerEmail: invoice.customer_email ?? undefined
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        events.push({ type: "subscription.cancelled", providerRef: sub.id, subscriptionId: sub.id });
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        events.push({
          type: "subscription.updated",
          providerRef: sub.id,
          subscriptionId: sub.id,
          status: sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "paused",
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : undefined,
          cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null
        });
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        events.push({
          type: "payment.refunded",
          providerRef: charge.payment_intent as string,
          amount: charge.amount_refunded,
          currency: charge.currency
        });
        break;
      }
      default:
        break;
    }
    return events;
  }
};

registerProvider(stripeProvider);
