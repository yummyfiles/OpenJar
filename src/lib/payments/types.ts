// Payment provider abstraction.
//
// Everything payment-related in OpenJar goes through the PaymentProvider
// interface below. Swap providers by setting PAYMENT_PROVIDER and dropping a
// file into src/lib/payments/providers/ — no page, service or route needs to
// know which processor is actually handling money.

export type PaymentProviderName = "stripe" | "lemonsqueezy" | "paypal" | "polar" | "paddle" | "manual";

export type PaymentMode = "payment" | "subscription";
export type BillingInterval = "month" | "year";

export interface CreateCheckoutParams {
  /** amount in minor units (cents) */
  amount: number;
  currency: string;
  mode: PaymentMode;
  interval?: BillingInterval;
  /** tier name for membership line items */
  tierName?: string;
  /** our internal refs — round-tripped back to us in webhooks */
  metadata: CheckoutMetadata;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}

export interface CheckoutMetadata {
  creatorId: string;
  supporterId?: string;
  donationId: string;
  kind: "one_time" | "membership";
  tierId?: string;
  interval?: BillingInterval;
  source: "web" | "api";
}

export interface PaymentIntent {
  id: string;
  checkoutUrl: string | null;
  clientSecret: string | null;
  provider: PaymentProviderName;
  amount: number;
  currency: string;
  mode: PaymentMode;
  metadata: CheckoutMetadata;
}

export type WebhookEvent =
  | {
      type: "payment.succeeded";
      providerRef: string;
      amount: number;
      currency: string;
      metadata: Partial<CheckoutMetadata> & Record<string, string>;
      customerEmail?: string;
      customerName?: string;
    }
  | {
      type: "subscription.created";
      providerRef: string;
      subscriptionId: string;
      metadata: Partial<CheckoutMetadata> & Record<string, string>;
      currentPeriodEnd?: string;
      customerEmail?: string;
    }
  | {
      type: "subscription.updated";
      providerRef: string;
      subscriptionId: string;
      status: "active" | "past_due" | "cancelled" | "paused" | "expired";
      currentPeriodEnd?: string;
      cancelAt?: string | null;
      customerEmail?: string;
    }
  | {
      type: "subscription.cancelled";
      providerRef: string;
      subscriptionId: string;
      customerEmail?: string;
    }
  | {
      type: "payment.refunded";
      providerRef: string;
      amount?: number;
      currency?: string;
    };

export interface PaymentProvider {
  readonly name: PaymentProviderName;
  /** is the provider configured (env keys present) and usable right now? */
  isConfigured(): boolean;
  createCheckout(params: CreateCheckoutParams): Promise<PaymentIntent>;
  cancelSubscription(params: { providerRef: string }): Promise<{ ok: boolean }>;
  /** parse + verify an incoming webhook payload. throws on bad signature. */
  verifyWebhook(headers: Headers, rawBody: string): Promise<WebhookEvent[]>;
}
