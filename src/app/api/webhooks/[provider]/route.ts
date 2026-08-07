import { NextResponse } from "next/server";
import { ApiError, getApiUser, handleError } from "@/lib/api";
import { getProviderByName } from "@/lib/payments/registry";
import { processWebhookEvents } from "@/server/services/webhooks";

export const dynamic = "force-dynamic";

// one webhook endpoint per provider, e.g. /api/webhooks/stripe
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
  try {
    const { provider } = await params;
    const paymentProvider = getProviderByName(provider as never);
    if (!paymentProvider) {
      return NextResponse.json({ error: { code: "not_found", message: "Unknown payment provider" } }, { status: 404 });
    }

    const rawBody = await req.text();
    let events;
    try {
      events = await paymentProvider.verifyWebhook(req.headers, rawBody);
    } catch {
      // bad signature — dont leak details to the caller
      return NextResponse.json({ error: { code: "invalid_signature", message: "Could not verify webhook" } }, { status: 400 });
    }

    const results = await processWebhookEvents(provider, events);
    return NextResponse.json({ data: { received: true, results } });
  } catch (err) {
    return handleError(err);
  }
}
