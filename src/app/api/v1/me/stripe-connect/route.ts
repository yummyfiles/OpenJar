import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  createAccountLink,
  ensureConnectAccount,
  getConnectAccount,
  isConnectConfigured
} from "@/lib/payments/providers/stripe";

export const dynamic = "force-dynamic";

// status of the creator's stripe connect account + a link to manage it
export async function GET(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const origin = process.env.BASE_URL ?? "http://localhost:3000";

    if (!user.stripeAccountId) {
      return NextResponse.json({
        data: {
          connected: false,
          configured: isConnectConfigured()
        }
      });
    }

    let status = { chargesEnabled: false, payoutsEnabled: false };
    try {
      status = await getConnectAccount(user.stripeAccountId);
    } catch {
      status = { chargesEnabled: false, payoutsEnabled: false };
    }

    return NextResponse.json({
      data: {
        connected: true,
        accountId: user.stripeAccountId,
        chargesEnabled: status.chargesEnabled,
        payoutsEnabled: status.payoutsEnabled,
        dashboardUrl: await createAccountLink(user.stripeAccountId, "account_update", origin)
      }
    });
  } catch (err) {
    return handleError(err);
  }
}

// create the express account if needed, then hand back an onboarding link
export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const origin = process.env.BASE_URL ?? "http://localhost:3000";

    if (!isConnectConfigured()) {
      throw new ApiError(503, "Stripe is not configured on this instance", "not_configured");
    }

    let accountId = user.stripeAccountId;
    if (!accountId) {
      const account = await ensureConnectAccount({
        email: user.email,
        name: user.displayName || user.name || user.email
      });
      accountId = account.accountId;
      await prisma.user.update({ where: { id: user.id }, data: { stripeAccountId: accountId } });
    }

    const url = await createAccountLink(accountId, "account_onboarding", origin);
    return NextResponse.json({ data: { connected: false, accountId, onboardingUrl: url } });
  } catch (err) {
    return handleError(err);
  }
}
