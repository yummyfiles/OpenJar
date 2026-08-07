import type { PaymentProvider, PaymentProviderName } from "./types";

// provider registry — the single place payment providers are wired up
const registry = new Map<PaymentProviderName, PaymentProvider>();

export function registerProvider(provider: PaymentProvider) {
  registry.set(provider.name, provider);
}

export function getProviderByName(name: PaymentProviderName): PaymentProvider | undefined {
  return registry.get(name);
}

// returns the active provider based on PAYMENT_PROVIDER env.
// falls back to the manual provider so the app still works without payment keys.
export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER ?? "manual") as PaymentProviderName;
  const provider = registry.get(name);
  if (!provider) {
    console.warn(`[payments] provider "${name}" is not registered, falling back to manual`);
    return registry.get("manual")!;
  }
  return provider;
}

/** providers that are registered AND have their env keys set */
export function listConfiguredProviders(): { name: PaymentProviderName; configured: boolean }[] {
  return Array.from(registry.values()).map((p) => ({
    name: p.name,
    configured: p.isConfigured()
  }));
}
