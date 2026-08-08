import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { WebhookEvent } from "@/lib/payments/types";
import { notify } from "./notifications";
import { trackActivity } from "./activity";
import { sendEmail, donationReceiptHtml, newDonationAlertHtml } from "./emails";

// Shared webhook processing. Every payment provider normalizes into WebhookEvent
// and this one function turns them into database state. No provider-specific
// logic should ever live below here.

export async function processWebhookEvents(provider: string, events: WebhookEvent[]) {
  const results: string[] = [];
  for (const event of events) {
    try {
      switch (event.type) {
        case "payment.succeeded":
          results.push(await onPaymentSucceeded(provider, event));
          break;
        case "subscription.created":
          await onSubscriptionCreated(provider, event);
          results.push("subscription created");
          break;
        case "subscription.updated":
          await onSubscriptionUpdated(provider, event);
          results.push("subscription updated");
          break;
        case "subscription.cancelled":
          await onSubscriptionCancelled(provider, event);
          results.push("subscription cancelled");
          break;
        case "payment.refunded":
          results.push(await onPaymentRefunded(provider, event));
          break;
      }
    } catch (err) {
      // a single bad event shouldn't kill the rest of the batch
      console.error("[webhook] event failed", event.type, err);
      results.push(`error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return results;
}

async function onPaymentSucceeded(provider: string, event: Extract<WebhookEvent, { type: "payment.succeeded" }>) {
  const { donation, isNew } = await upsertDonationFromEvent(provider, event.providerRef, event.metadata, event.amount, event.currency, event.customerEmail, event.customerName);

  if (donation.status !== "completed") {
    await prisma.donation.update({
      where: { id: donation.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        providerRef: event.providerRef,
        supporterEmail: event.customerEmail ?? donation.supporterEmail
      }
    });
  }

  if (isNew && !donation.anonymous) {
    await trackActivity(donation.creatorId, "donation", {
      amount: donation.amount,
      currency: donation.currency,
      supporter: donation.supporterName || event.customerName || null
    });
    await notify({
      userId: donation.creatorId,
      actorId: donation.supporterId ?? undefined,
      type: "donation",
      title: `New donation of ${formatMoney(donation.amount, donation.currency)}`,
      body: donation.message?.slice(0, 140) ?? undefined,
      link: "/dashboard/donations"
    });
  }

  // bump the goal if the money targets one — handled implicitly by aggregation
  await maybeCompleteGoals(donation.creatorId);

  if (isNew) {
    await sendPaymentEmails(donation, event.customerName);
  }

  return `payment ${donation.id} marked completed`;
}

async function onSubscriptionCreated(provider: string, event: Extract<WebhookEvent, { type: "subscription.created" }>) {
  const creatorId = event.metadata.creatorId;
  const supporterId = event.metadata.supporterId;
  const tierId = event.metadata.tierId;
  if (!creatorId || !supporterId || !tierId) return;

  const existing = await prisma.subscription.findUnique({
    where: { supporterId_tierId: { supporterId, tierId } }
  });

  if (existing) {
    await prisma.subscription.update({
      where: { id: existing.id },
      data: {
        status: "active",
        provider,
        providerRef: event.subscriptionId,
        currentPeriodEnd: event.currentPeriodEnd ? new Date(event.currentPeriodEnd) : null,
        cancelAt: null
      }
    });
  } else {
    await prisma.subscription.create({
      data: {
        creatorId,
        supporterId,
        tierId,
        status: "active",
        provider,
        providerRef: event.subscriptionId,
        interval: (event.metadata.interval as "month" | "year") ?? "month",
        currentPeriodEnd: event.currentPeriodEnd ? new Date(event.currentPeriodEnd) : null
      }
    });
  }

  // first invoice payment
  const donation = await upsertDonationFromEvent(
    provider,
    event.subscriptionId,
    event.metadata,
    0,
    "usd",
    event.customerEmail
  );
  if (donation.donation.status === "pending") {
    await prisma.donation.update({
      where: { id: donation.donation.id },
      data: { status: "completed", completedAt: new Date(), providerRef: event.subscriptionId }
    });
  }
}

async function onSubscriptionUpdated(provider: string, event: Extract<WebhookEvent, { type: "subscription.updated" }>) {
  const sub = await prisma.subscription.findFirst({ where: { providerRef: event.subscriptionId } });
  if (!sub) return;

  const status =
    event.status === "active"
      ? "active"
      : event.status === "past_due"
        ? "past_due"
        : event.status === "cancelled"
          ? "cancelled"
          : "ended";

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      status,
      currentPeriodEnd: event.currentPeriodEnd ? new Date(event.currentPeriodEnd) : sub.currentPeriodEnd,
      cancelAt: event.cancelAt ? new Date(event.cancelAt) : null
    }
  });
}

async function onSubscriptionCancelled(provider: string, event: Extract<WebhookEvent, { type: "subscription.cancelled" }>) {
  const sub = await prisma.subscription.findFirst({ where: { providerRef: event.subscriptionId } });
  if (!sub) return;
  await prisma.subscription.update({ where: { id: sub.id }, data: { status: "cancelled", cancelAt: new Date() } });

  await notify({
    userId: sub.creatorId,
    type: "system",
    title: "A membership was cancelled",
    link: "/dashboard/subscribers"
  });
}

async function onPaymentRefunded(provider: string, event: Extract<WebhookEvent, { type: "payment.refunded" }>) {
  const donation = await prisma.donation.findFirst({
    where: { provider, providerRef: event.providerRef }
  });
  if (!donation) return "refund for unknown payment, skipped";
  await prisma.donation.update({ where: { id: donation.id }, data: { status: "refunded" } });
  return `payment ${donation.id} marked refunded`;
}

// upserts a donation keyed by (provider, providerRef). returns whether the
// row is freshly created so callers only fire notifications once.
async function upsertDonationFromEvent(
  provider: string,
  providerRef: string,
  metadata: Record<string, string>,
  amount: number,
  currency: string,
  customerEmail?: string,
  customerName?: string
) {
  const existing = await prisma.donation.findUnique({
    where: { provider_providerRef: { provider, providerRef } }
  });
  if (existing) return { donation: existing, isNew: false };

  // find the pending row created at checkout time
  const pending = metadata.donationId
    ? await prisma.donation.findUnique({ where: { id: metadata.donationId } })
    : null;

  if (pending) {
    return { donation: pending, isNew: true };
  }

  if (!metadata.creatorId) throw new Error("webhook has no creatorId metadata");

  const tier = metadata.tierId ? await prisma.tier.findUnique({ where: { id: metadata.tierId } }).catch(() => null) : null;

  const donation = await prisma.donation.create({
    data: {
      id: randomBytes(6).toString("hex"),
      creatorId: metadata.creatorId,
      supporterId: metadata.supporterId || null,
      supporterName: customerName,
      supporterEmail: customerEmail,
      amount: amount || tier?.price || 0,
      currency,
      kind: metadata.kind === "membership" ? "membership" : "one_time",
      tierId: tier?.id ?? null,
      interval: (metadata.interval as "month" | "year") ?? undefined,
      status: "pending",
      provider,
      providerRef
    }
  });
  return { donation, isNew: true };
}

async function maybeCompleteGoals(creatorId: string) {
  const goals = await prisma.goal.findMany({ where: { creatorId, completed: false } });
  if (goals.length === 0) return;

  for (const goal of goals) {
    const raised = await prisma.donation.aggregate({
      where: { creatorId, status: "completed", createdAt: { gte: goal.createdAt } },
      _sum: { amount: true }
    });
    const total = raised._sum.amount ?? 0;
    if (total >= goal.amount && !goal.completed) {
      await prisma.goal.update({ where: { id: goal.id }, data: { completed: true, completedAt: new Date() } });
      await trackActivity(creatorId, "milestone", { goal: goal.title });
      await notify({
        userId: creatorId,
        type: "milestone",
        title: `Goal reached: ${goal.title}`,
        link: "/dashboard/goals"
      });
    }
  }
}

function formatMoney(amount: number, currency: string) {
  return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

async function sendPaymentEmails(donation: { id: string; creatorId: string; supporterEmail: string | null; supporterName: string | null; anonymous: boolean; amount: number; currency: string; kind: string }, customerName?: string | null) {
  const creator = await prisma.user.findUnique({
    where: { id: donation.creatorId },
    select: { email: true, displayName: true, name: true, username: true }
  });
  if (!creator) return;

  const base = process.env.BASE_URL ?? "http://localhost:3000";
  const supporterEmail = donation.supporterEmail;
  const supporterLabel = donation.anonymous ? "a supporter" : (donation.supporterName || customerName || "a supporter");

  if (donation.kind === "membership") {
    return; // membership welcome emails handled elsewhere
  }

  if (supporterEmail) {
    await sendEmail({
      to: supporterEmail,
      subject: `Your donation to ${creator.displayName || creator.name} is confirmed`,
      html: donationReceiptHtml({
        amount: formatMoney(donation.amount, donation.currency),
        creatorName: creator.displayName || creator.name || "creator",
        date: new Date().toLocaleDateString(),
        url: `${base}/${creator.username}`
      })
    });
  }

  await sendEmail({
    to: creator.email,
    subject: `New donation: ${formatMoney(donation.amount, donation.currency)}`,
    html: newDonationAlertHtml({
      amount: formatMoney(donation.amount, donation.currency),
      supporter: supporterLabel,
      url: `${base}/dashboard/donations`
    })
  });
}
