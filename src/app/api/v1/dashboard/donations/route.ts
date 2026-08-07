import { NextResponse } from "next/server";
import { getApiUser, handleError, readJson } from "@/lib/api";
import { recordManualDonation } from "@/server/services/donations";
import { z } from "zod";

const manualSchema = z.object({
  amount: z.number().int().positive(),
  currency: z.string().length(3).default("usd"),
  supporterName: z.string().max(120).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  anonymous: z.boolean().optional()
});

export async function POST(req: Request) {
  try {
    const { user } = await getApiUser(req.headers);
    const input = manualSchema.parse(await readJson(req));
    const donation = await recordManualDonation(user.id, {
      amount: input.amount,
      currency: input.currency,
      supporterName: input.supporterName,
      message: input.message,
      anonymous: input.anonymous
    });
    return NextResponse.json({ data: donation }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
