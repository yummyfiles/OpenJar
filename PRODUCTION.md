# Running OpenJar in production

Everything below is a hardening checklist. OpenJar is designed to work with a
plain Postgres instance on any host — Vercel, Fly.io, Render, a VPS — and every
service is optional behind an env var.

## 1. Required

| Env var | What it does |
| --- | --- |
| `DATABASE_URL` | Postgres connection string. |
| `BETTER_AUTH_SECRET` | Session signing secret. Generate with `openssl rand -base64 32`. |
| `BASE_URL` | The public origin, e.g. `https://openjar.example.com`. Used for links, redirects, and the API CORS allowlist. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | Comma-separated origins allowed to authenticate (your domain plus any preview envs). |

Without a payment key the donation flow runs in "stripe test mode" style —
set one of the keys below to actually take money.

## 2. Payments (Stripe)

Two modes:

- **Simple mode** (default): donations land in your own Stripe account.
  `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET`.
- **Stripe Connect** (recommended once creators sign up): each creator gets an
  Express account and money flows directly to them with a 0% platform fee.
  Same two keys; creators connect via **Settings → Stripe payouts**.

Webhook endpoint: `POST /api/webhooks/stripe` with the event types
`checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
`customer.subscription.updated`, `customer.subscription.deleted`,
`charge.refunded`, `account.updated`.

## 3. Email (Resend)

Optional but strongly recommended — without it password resets and receipts
are silently skipped.

| Env var | What it does |
| --- | --- |
| `RESEND_API_KEY` | Enables sending. |
| `EMAIL_FROM` | Sender, e.g. `OpenJar <no-reply@yourdomain.com>`. |

## 4. Observability (Sentry)

| Env var | What it does |
| --- | --- |
| `SENTRY_DSN` | Server + edge error reporting. |
| `NEXT_PUBLIC_SENTRY_DSN` | Browser error reporting. |
| `SENTRY_AUTH_TOKEN` | Uploads source maps during build (optional; builds stay green without it). |

Every unhandled API error is routed through `Sentry.captureException`.

## 5. Rate limiting (Vercel KV / Upstash)

The in-memory fallback only works on a single instance. For anything deployed
as serverless functions, set these so counters are shared:

| Env var | What it does |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | KV REST URL. |
| `UPSTASH_REDIS_REST_TOKEN` | KV REST token. |

`src/lib/rate-limit.ts` uses a fixed-window counter per IP+key and falls back
to memory if Redis is unreachable, so a Redis outage never takes the API down.

## 6. Content moderation

`src/lib/moderation.ts` blocks the common spam patterns (crypto giveaways,
link-dumps, repeated phrases). Set `MODERATION_MODE=log` to log instead of
reject while you tune it.

## 7. File uploads (S3-compatible)

Set `S3_*` (see `.env.example`) to enable avatar/cover uploads to S3, R2, or
MinIO. Uploads are rate-limited per IP.

## 8. GitHub sync

`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` are used for both social login and
the optional GitHub profile sync (`Settings → Refresh GitHub data`). GitHub
login requires a callback URL of `${BASE_URL}/api/auth/callback/github`.

## 9. Legal pages

`/terms`, `/privacy` and `/cookies` are served from `src/app/(legal)/` and are
plain content pages — edit the copy there to match your jurisdiction. The
footer links to them automatically.

## 10. Production checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # next build (with Sentry plugin active)
npx prisma migrate deploy
npm run start
```

Smoke tests (needs a running instance):

```bash
npx playwright install chromium
npm run build
npx playwright test
```

## 11. Multi-instance caveats

- Rate limiting: configure Upstash KV (section 5).
- Background jobs: goal-milestone checks and notification fan-out run inline
  in webhooks; keep the webhook endpoint on a single worker or add a queue
  before scaling writes.
