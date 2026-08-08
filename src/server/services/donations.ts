import { prisma } from "@/lib/prisma";
import { randomId } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { getPaymentProvider } from "@/lib/payments";
import type { CreateCheckoutParams } from "@/lib/payments/types";
import { notify } from "./notifications";
import { trackActivity } from "./activity";

export interface DonationIntentInput {
  creator: {
    id: string;
    minDonation: number;
    allowAnonymous: boolean;
    allowMessages: boolean;
    currency: string;
    stripeAccountId?: string | null;
  };
  supporter?: { id: string; email?: string; name?: string } | null;
  amount: number;
  currency?: string;
  kind: "one_time" | "membership";
  tierId?: string;
  interval?: "month" | "year";
  message?: string;
  anonymous?: boolean;
  source?: "web" | "api";
}

/**
 * Single entry point for creating a checkout. Kept separate from the helper
 * above because the caller knows the creator's username for redirect urls.
 */
export async function createCheckout(input: DonationIntentInput & { redirectTo: string }) {
  const currency = (input.currency ?? input.creator.currency ?? "usd").toLowerCase();

  if (input.amount < input.creator.minDonation) {
    throw new ApiError(400, `Minimum donation is ${(input.creator.minDonation / 100).toFixed(2)} ${currency.toUpperCase()}`);
  }
  if (input.message && !input.creator.allowMessages) {
    throw new ApiError(400, "This creator does not accept messages with donations");
  }
  if (input.kind === "membership" && !input.supporter) {
    throw new ApiError(401, "Sign in to start a membership");
  }

  const tier = input.tierId
    ? await prisma.tier.findFirst({ where: { id: input.tierId, creatorId: input.creator.id, active: true } })
    : null;
  if (input.kind === "membership" && !tier) {
    throw new ApiError(404, "That membership tier does not exist");
  }

  const donation = await prisma.donation.create({
    data: {
      id: randomId("don"),
      creatorId: input.creator.id,
      supporterId: input.supporter?.id ?? null,
      amount: input.amount,
      currency,
      message: input.message || null,
      anonymous: input.anonymous ?? false,
      kind: input.kind,
      interval: input.kind === "membership" ? input.interval ?? "month" : null,
      tierId: tier?.id ?? null,
      status: "pending",
      provider: getPaymentProvider().name
    }
  });

  const params: CreateCheckoutParams = {
    amount: input.amount,
    currency,
    mode: input.kind === "membership" ? "subscription" : "payment",
    interval: input.kind === "membership" ? input.interval ?? "month" : undefined,
    tierName: tier?.name,
    // stripe connect express: route the money straight to the creator's account.
    // platform fee is $0 — the creator simply absorbs Stripe's processing fees.
    connectAccountId: input.creator.stripeAccountId ?? undefined,
    platformFee: 0,
    metadata: {
      creatorId: input.creator.id,
      supporterId: input.supporter?.id ?? undefined,
      donationId: donation.id,
      kind: input.kind,
      tierId: tier?.id,
      interval: input.kind === "membership" ? input.interval ?? "month" : undefined,
      source: input.source ?? "web"
    },
    successUrl: `${input.redirectTo}?donation=success`,
    cancelUrl: `${input.redirectTo}?donation=cancelled`
  };

  try {
    const intent = await getPaymentProvider().createCheckout(params);
    return { donation, intent };
  } catch (err) {
    // dont leave orphan pending donations behind
    await prisma.donation.update({ where: { id: donation.id }, data: { status: "failed" } }).catch(() => {});
    throw err;
  }
}

export async function getCreatorDonationSummary(creatorId: string) {
  const monthKey = new Date().toISOString().slice(0, 7);

  const [totals, monthly, counts, recent] = await Promise.all([
    prisma.donation.aggregate({
      where: { creatorId, status: "completed" },
      _sum: { amount: true },
      _count: true
    }),
    prisma.donation.aggregate({
      where: { creatorId, status: "completed", createdAt: { gte: new Date(`${monthKey}-01`) } },
      _sum: { amount: true },
      _count: true
    }),
    prisma.donation.count({ where: { creatorId, status: "completed" } }),
    prisma.donation.findMany({
      where: { creatorId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { supporter: { select: { id: true, name: true, username: true, image: true, displayName: true } } }
    })
  ]);

  return {
    totalRaised: totals._sum.amount ?? 0,
    totalDonations: counts,
    monthlyRaised: monthly._sum.amount ?? 0,
    monthlyDonations: monthly._count,
    recent
  };
}

export async function getSubscriberCount(creatorId: string) {
  return prisma.subscription.count({ where: { creatorId, status: "active" } });
}

// creator records a payment they collected outside a provider (manual provider,
// offline donation, cash). produces the same activity + notifications as a
// provider payment so nothing downstream knows the difference.
export async function recordManualDonation(
  creatorId: string,
  input: { amount: number; currency?: string; supporterName?: string; message?: string; anonymous?: boolean }
) {
  const donation = await prisma.donation.create({
    data: {
      id: randomId("don"),
      creatorId,
      amount: input.amount,
      currency: (input.currency ?? "usd").toLowerCase(),
      supporterName: input.supporterName || null,
      message: input.message || null,
      anonymous: input.anonymous ?? false,
      kind: "one_time",
      status: "completed",
      completedAt: new Date(),
      provider: "manual"
    }
  });

  if (!donation.anonymous) {
    await trackActivity(creatorId, "donation", { amount: donation.amount, currency: donation.currency, supporter: donation.supporterName });
  }
  await notify({
    userId: creatorId,
    type: "donation",
    title: `Donation of ${(donation.amount / 100).toFixed(2)} ${donation.currency.toUpperCase()} recorded`,
    link: "/dashboard/donations"
  });
  return donation;
}
