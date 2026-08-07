import type { CreateCheckoutParams, PaymentIntent, PaymentProvider, WebhookEvent, PaymentProviderName } from "../types";
import { registerProvider } from "../registry";

// The manual provider lets creators collect donations without a payment
// processor configured (local dev, self-host, or offline/handshake payments).
// "checkouts" resolve to the creator's dashboard where they record the payment.

const providerName: PaymentProviderName = "manual";

export const manualProvider: PaymentProvider = {
  name: providerName,

  isConfigured() {
    return true;
  },

  async createCheckout(params: CreateCheckoutParams): Promise<PaymentIntent> {
    return {
      id: `manual_${params.metadata.donationId}`,
      checkoutUrl: null,
      clientSecret: null,
      provider: providerName,
      amount: params.amount,
      currency: params.currency,
      mode: params.mode,
      metadata: params.metadata
    };
  },

  async cancelSubscription() {
    return { ok: true };
  },

  async verifyWebhook(): Promise<WebhookEvent[]> {
    // the manual provider has no webhooks — payments are recorded manually
    return [];
  }
};

registerProvider(manualProvider);
