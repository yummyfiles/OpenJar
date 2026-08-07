import { prisma } from "@/lib/prisma";
import { GITHUB_REFRESH_INTERVAL } from "@/lib/constants";

const API = "https://api.github.com";
const GH_HEADERS: Record<string, string> = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "OpenJar"
};

function token(): string | null {
  return process.env.GITHUB_TOKEN ?? null;
}

async function ghFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { ...GH_HEADERS, ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...init?.headers },
    cache: "no-store"
  });
  if (res.status === 404) throw new Error("not_found");
  if (res.status === 403 || res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error(`github_error_${res.status}`);
  return res.json() as Promise<T>;
}

interface GhRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
}

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
  location: string | null;
}

export async function fetchGitHubProfile(username: string): Promise<GhUser> {
  return ghFetch<GhUser>(`/users/${encodeURIComponent(username)}`);
}

export async function fetchGitHubRepos(username: string): Promise<GhRepo[]> {
  // public API caps at 100/page; 3 pages is plenty for a profile page
  const pages = await Promise.all(
    [1, 2, 3].map((p) =>
      ghFetch<GhRepo[]>(`/users/${encodeURIComponent(username)}/repos?per_page=100&page=${p}&sort=stargazers`).catch(
        () => [] as GhRepo[]
      )
    )
  );
  return pages.flat().sort((a, b) => b.stargazers_count - a.stargazers_count);
}

interface ContributionDay {
  date: string;
  contributionCount: number;
}
interface ContributionWeek {
  contributionDays: ContributionDay[];
}

// the contribution calendar is only available through GraphQL which needs a
// token — public REST has no equivalent. returns null when we cant fetch it.
export async function fetchContributionGraph(username: string): Promise<{ weeks: { date: string; count: number }[]; total: number } | null> {
  const t = token();
  if (!t) return null;

  const query = `query($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }`;

  const res = await fetch(`${API}/graphql`, {
    method: "POST",
    headers: { ...GH_HEADERS, Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
    cache: "no-store"
  });

  if (!res.ok) return null;
  const json = (await res.json()) as {
    data?: {
      user?: {
        contributionsCollection?: {
          contributionCalendar?: {
            totalContributions: number;
            weeks: ContributionWeek[];
          };
        };
      };
    };
  };

  const cal = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!cal) return null;

  const weeks = cal.weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
  return { weeks, total: cal.totalContributions };
}

// sync a creator's GitHub data into our cache tables
export async function refreshCreatorGitHub(userId: string, githubUsername: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("user_not_found");

  // dont hammer the api more than every 30 min per creator
  if (user.ghUpdatedAt && Date.now() - user.ghUpdatedAt.getTime() < GITHUB_REFRESH_INTERVAL * 1000) {
    return { cached: true };
  }

  const [profile, repos, contributions] = await Promise.all([
    fetchGitHubProfile(githubUsername).catch(() => null),
    fetchGitHubRepos(githubUsername).catch(() => []),
    fetchContributionGraph(githubUsername).catch(() => null)
  ]);

  // delete old repo rows and write fresh ones (simpler than diffing)
  await prisma.$transaction(async (tx) => {
    await tx.repo.deleteMany({ where: { creatorId: userId } });

    for (const repo of repos.slice(0, 24)) {
      await tx.repo.create({
        data: {
          creatorId: userId,
          repoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          description: repo.description,
          url: repo.html_url,
          homepage: repo.homepage,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          openIssues: repo.open_issues_count
        }
      });
    }

    if (contributions) {
      await tx.contributorGraph.upsert({
        where: { userId },
        create: { userId, weeks: contributions.weeks as object, total: contributions.total },
        update: { weeks: contributions.weeks as object, total: contributions.total }
      });
    }
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      ghData: { profile, syncedAt: new Date().toISOString() } as object,
      ghUpdatedAt: new Date()
    }
  });

  return { cached: false };
}

export async function getGitHubPageData(userId: string) {
  const [repos, graph, user] = await Promise.all([
    prisma.repo.findMany({ where: { creatorId: userId }, orderBy: [{ pinned: "desc" }, { stars: "desc" }] }),
    prisma.contributorGraph.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { ghData: true } })
  ]);

  return {
    repos,
    contributions: graph,
    profile: (user?.ghData as { profile?: GhUser | null } | null)?.profile ?? null
  };
}
