// lightweight content filter for user-generated text. not a replacement for a
// real moderation stack, but it catches the bulk of crypto-spam and link-dump
// comments that hit open-source projects.

const BLOCKED_WORDS = [
  "sex cams",
  "escort service",
  "casino bonus",
  "binary options",
  "forex signal",
  "get rich quick",
  "work from home scam",
  "bitcoin investment",
  "ethereum investment",
  "crypto giveaways",
  "free crypto",
  "airdrop",
  "verify your wallet",
  "metamask",
  "phantom wallet",
  "nft giveaway",
  "onlyfans",
  "webcam girls",
  "buy followers",
  "boost instagram",
  "increase instagram",
  "btc giveaway",
  "double your money",
  "instant payout",
  "no deposit bonus",
  "prize claimed",
  "you have been selected",
  "click here to claim",
  "limited slots remaining"
];

const URL_RE = /(https?:\/\/|www\.)/g;

export type ModerationResult = {
  blocked: boolean;
  reason?: string;
};

export function checkContent(text: string): ModerationResult {
  if (!text || !text.trim()) {
    return { blocked: true, reason: "empty content" };
  }

  const lower = text.toLowerCase();

  // exact-block common spam phrases
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return { blocked: true, reason: `blocked phrase: ${word}` };
    }
  }

  const words = text.split(/\s+/);
  const urlCount = (text.match(URL_RE) ?? []).length;

  // a comment that is mostly links is almost always spam
  if (urlCount >= 2 && urlCount >= Math.ceil(words.length * 0.4)) {
    return { blocked: true, reason: "too many links" };
  }

  // repeated single characters — "aaaaa" style spam or password-ish noise
  const repeated = lower.match(/(.)\1{10,}/);
  if (repeated) {
    return { blocked: true, reason: "repeated characters" };
  }

  // repeated tokens — the classic "click here click here click here"
  const tokens = lower.match(/[a-z]{4,}/g) ?? [];
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);
  for (const [, count] of freq) {
    if (count >= 4 && words.length <= 30) {
      return { blocked: true, reason: "repeated phrase" };
    }
  }

  return { blocked: false };
}

// moderation.mjs style — allow the filter to be tuned via env without a rebuild
export function moderationConfig() {
  return {
    // soft mode logs and rejects, hard mode silently drops — we default to
    // rejecting so spam never reaches the database.
    mode: (process.env.MODERATION_MODE ?? "reject") as "reject" | "log"
  };
}
