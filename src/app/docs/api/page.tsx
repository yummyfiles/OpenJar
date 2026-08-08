import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";
import { BASE_URL } from "@/lib/constants";

export const metadata: Metadata = { title: "API Docs" };

const ENDPOINTS = [
  {
    group: "Public",
    items: [
      { method: "GET", path: "/api/v1/discover/creators", desc: "List creators. Query params: q, category, language, sort (trending|newest|featured), page, perPage.", auth: false },
      { method: "GET", path: "/api/v1/discover/projects", desc: "List projects. Same query params as creators.", auth: false },
      { method: "GET", path: "/api/v1/creators/{username}", desc: "Full public creator page data: profile, posts, projects, tiers, goals, supporters, github.", auth: false },
      { method: "GET", path: "/api/v1/posts/{id}", desc: "Single post with markdown content, like count, and vote state.", auth: false },
      { method: "GET", path: "/api/v1/posts/{id}/comments", desc: "List comments for a post.", auth: false },
      { method: "POST", path: "/api/v1/posts/{id}/comments", desc: "Add a comment. Body: { content, parentId? }. Requires session.", auth: true },
      { method: "POST", path: "/api/v1/posts/{id}/like", desc: "Toggle like on a post. Returns { liked }.", auth: true },
      { method: "GET", path: "/api/v1/tiers", desc: "List a creator's tiers (query: creatorId).", auth: false }
    ]
  },
  {
    group: "Creator",
    items: [
      { method: "POST", path: "/api/v1/posts", desc: "Create a post. Body: { content, title?, excerpt?, status, pinned?, poll? }.", auth: true },
      { method: "PATCH", path: "/api/v1/posts/{id}", desc: "Update a post (partial).", auth: true },
      { method: "DELETE", path: "/api/v1/posts/{id}", desc: "Delete your post.", auth: true },
      { method: "POST", path: "/api/v1/tiers", desc: "Create a membership tier. Body: { name, price, currency?, description?, perks? }.", auth: true },
      { method: "POST", path: "/api/v1/goals", desc: "Create a funding goal. Body: { title, amount, description?, deadline? }.", auth: true },
      { method: "PATCH", path: "/api/v1/goals/{id}", desc: "Update or complete a goal.", auth: true },
      { method: "GET", path: "/api/v1/dashboard/analytics", desc: "Views/donations series. Query: days (default 30, max 90).", auth: true },
      { method: "GET", path: "/api/v1/dashboard/content", desc: "Your posts, tiers, goals, projects.", auth: true },
      { method: "GET", path: "/api/v1/dashboard/subscribers", desc: "List your active subscriptions.", auth: true },
      { method: "POST", path: "/api/v1/dashboard/github", desc: "Refresh your GitHub sync (rate-limited).", auth: true }
    ]
  },
  {
    group: "Account",
    items: [
      { method: "GET", path: "/api/v1/me", desc: "Current user profile.", auth: true },
      { method: "PATCH", path: "/api/v1/me/profile", desc: "Update profile fields (onboarding or regular).", auth: true },
      { method: "GET", path: "/api/v1/me/notifications", desc: "Your notifications.", auth: true },
      { method: "GET", path: "/api/v1/me/api-keys", desc: "List your API keys.", auth: true },
      { method: "POST", path: "/api/v1/me/api-keys", desc: "Create an API key with scopes. The full key is returned once.", auth: true },
      { method: "DELETE", path: "/api/v1/me/api-keys/{id}", desc: "Revoke an API key.", auth: true }
    ]
  },
  {
    group: "Support",
    items: [
      { method: "POST", path: "/api/v1/creators/{username}/donations", desc: "Create a donation intent. Body: { amount, currency?, kind?, tierId?, interval?, message?, anonymous? }. Amount is in minor units (cents).", auth: false },
      { method: "POST", path: "/api/v1/creators/{username}/follow", desc: "Follow/unfollow toggle.", auth: true },
      { method: "POST", path: "/api/v1/creators/{username}/bookmark", desc: "Bookmark/unbookmark toggle.", auth: true },
      { method: "POST", path: "/api/v1/creators/{username}/view", desc: "Record a page view.", auth: false },
      { method: "POST", path: "/api/v1/reports", desc: "Report content. Body: { targetType, targetId, reason, details? }.", auth: true }
    ]
  }
];

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET" ? "text-emerald-400" : method === "POST" ? "text-sky-400" : method === "PATCH" ? "text-amber-400" : "text-red-400";
  return <span className={`shrink-0 w-14 font-mono text-[11px] font-semibold ${color}`}>{method}</span>;
}

export default function ApiDocsPage() {
  return (
    <>
      <StaticHeader
        eyebrow="developers"
        title="API reference"
        description={`The OpenJar API is JSON over HTTPS. Base URL: ${BASE_URL}. Authenticate with a session cookie or an x-openjar-key header. Errors return { "error": { "code", "message" } }.`}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <section className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <h2 className="label-mono">authentication</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            API keys are created in your account via{" "}
            <code className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs">POST /api/v1/me/api-keys</code>. Send them as{" "}
            <code className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs">x-openjar-key: &lt;key&gt;</code>. Keys are hashed at rest
            and can be revoked at any time. Routes marked private return{" "}
            <code className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs">401</code> without auth.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4 font-mono text-xs text-neutral-300">
{`curl -H "x-openjar-key: okj_live_..." \\
     https://openjar.app/api/v1/me`}
          </pre>
        </section>

        {ENDPOINTS.map((group) => (
          <section key={group.group} className="mt-10">
            <h2 className="label-mono">{group.group}</h2>
            <div className="mt-4 divide-y divide-neutral-800/60 rounded-xl border border-neutral-800 bg-neutral-950/60">
              {group.items.map((item) => (
                <div key={item.path} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:gap-4">
                  <div className="flex items-center gap-3 sm:w-72 sm:shrink-0">
                    <MethodBadge method={item.method} />
                    <code className="break-all font-mono text-xs text-neutral-200">{item.path}</code>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs leading-relaxed text-neutral-500">{item.desc}</p>
                    {item.auth ? (
                      <span className="mt-1 inline-block rounded-full bg-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-400">
                        private
                      </span>
                    ) : (
                      <span className="mt-1 inline-block rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
                        public
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10 rounded-xl border border-neutral-800 bg-neutral-950/60 p-5">
          <h2 className="label-mono">webhooks</h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Payment providers post events to{" "}
            <code className="rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 font-mono text-xs">/api/webhooks/{"{provider}"}</code> with provider signatures
            verified before processing. Donations are recorded with matching intents and creators are notified in real time.
          </p>
        </section>
      </div>
    </>
  );
}
