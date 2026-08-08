import { Resend } from "resend";

// thin email wrapper. everything is a no-op (console.log in dev) until
// RESEND_API_KEY is set, so the app works fully offline.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendEmail(opts: { to: string; subject: string; html: string; text?: string }) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[email:dev] to=${opts.to} subject="${opts.subject}"`);
    }
    return { ok: false as const, reason: "resend not configured" };
  }

  const from = process.env.EMAIL_FROM ?? "OpenJar <no-reply@openjar.dev>";
  try {
    const result = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text
    });
    return { ok: !result.error, error: result.error ?? null };
  } catch (err) {
    console.error("[email]", err);
    return { ok: false as const, error: err };
  }
}

export function donationReceiptHtml(opts: { amount: string; creatorName: string; date: string; url: string }) {
  return `<div style="font-family:system-ui;max-width:520px;margin:0 auto;color:#0a0a0a">
  <h1 style="font-size:20px">Thanks for your support</h1>
  <p>Your payment of <strong>${opts.amount}</strong> to <strong>${opts.creatorName}</strong> on ${opts.date} is confirmed.</p>
  <p>OpenJar is free and open source. If you need anything, reply to this email.</p>
  <p><a href="${opts.url}" style="color:#000">View your receipt</a></p>
</div>`;
}

export function newDonationAlertHtml(opts: { amount: string; supporter: string; url: string }) {
  return `<div style="font-family:system-ui;max-width:520px;margin:0 auto;color:#0a0a0a">
  <h1 style="font-size:20px">You received a new donation</h1>
  <p><strong>${opts.supporter}</strong> just supported you with <strong>${opts.amount}</strong>.</p>
  <p><a href="${opts.url}" style="color:#000">View it in your settings</a></p>
</div>`;
}

export function passwordResetHtml(opts: { url: string; name: string }) {
  return `<div style="font-family:system-ui;max-width:520px;margin:0 auto;color:#0a0a0a">
  <h1 style="font-size:20px">Reset your password</h1>
  <p>Hi ${opts.name}, click the button below to set a new password. The link expires in one hour.</p>
  <p><a href="${opts.url}" style="display:inline-block;background:#0a0a0a;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
  <p style="font-size:12px;color:#999">If you didn't request this, you can safely ignore this email.</p>
</div>`;
}
