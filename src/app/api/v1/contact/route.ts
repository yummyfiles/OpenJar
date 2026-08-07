import { NextResponse } from "next/server";
import { handleError, readJson } from "@/lib/api";
import { contactSchema } from "@/lib/validations";
import { sendEmail } from "@/server/services/emails";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@openjar.dev";

export async function POST(req: Request) {
  try {
    const input = contactSchema.parse(await readJson(req));
    const result = await sendEmail({
      to: SUPPORT_EMAIL,
      subject: `[OpenJar contact] from ${input.email}`,
      text: input.message,
      html: `<div style="font-family:system-ui;color:#0a0a0a">
        <p><strong>From:</strong> ${input.email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap">${input.message}</p>
      </div>`
    });

    return NextResponse.json({
      data: {
        ok: true,
        delivered: result.ok,
        note: result.ok ? "Message sent" : "Message queued (email not configured)"
      }
    });
  } catch (err) {
    return handleError(err);
  }
}
