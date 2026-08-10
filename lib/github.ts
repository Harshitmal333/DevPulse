import { Octokit } from "@octokit/rest";

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  commits: number;
}

export interface RepoBreakdown {
  repo: string;
  commits: number;
}

export interface UserRepo {
  fullName: string;
  name: string;
  description: string | null;
  private: boolean;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
  htmlUrl: string;
  commits90d: number;
}

export interface GithubStatsSummary {
  login: string;
  avatarUrl: string;
  totalCommits: number;
  totalPRsOpened: number;
  totalPRsMerged: number;
  totalIssuesClosed: number;
  currentStreak: number;
  longestStreak: number;
  dailyActivity: DailyActivity[];
  repoBreakdown: RepoBreakdown[];
  repositories: UserRepo[];
  fetchedAt: string;
}

interface RawRepo {
  full_name: string;
  name: string;
  description: string | null;
  private: boolean;
  language?: string | null;
  stargazers_count?: number;
  updated_at?: string | null;
  pushed_at?: string | null;
  html_url: string;
}

const LOOKBACK_DAYS = 90;

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Rolls up 90 days of activity for a resolved GitHub user into the shape
 * the dashboard needs. Uses the search API for commits (author-scoped,
 * cheap) rather than paging every repo's commit list. Shared by the
 * viewer's own (private+public) stats and the public-only "compare"
 * lookup — both resolve a login/avatar/repo-list up front and hand them
 * here.
 */
async function buildStatsSummary(
  octokit: Octokit,
  login: string,
  avatarUrl: string,
  rawRepos: RawRepo[]
): Promise<GithubStatsSummary> {
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceStr = iso(since);

  // --- Commits authored by the user, across all repos, in the window ---
  const commitSearch = await octokit.search.commits({
    q: `author:${login} committer-date:>=${sinceStr}`,
    sort: "committer-date",
    order: "desc",
    per_page: 100,
  });

  const dayBuckets = new Map<string, number>();
  const repoBuckets = new Map<string, number>();

  for (const item of commitSearch.data.items) {
    const date = iso(new Date(item.commit.committer?.date ?? item.commit.author?.date ?? Date.now()));
    dayBuckets.set(date, (dayBuckets.get(date) ?? 0) + 1);

    const repoName = item.repository.full_name;
    repoBuckets.set(repoName, (repoBuckets.get(repoName) ?? 0) + 1);
  }

  // --- Pull requests opened/merged by the user ---
  const prSearch = await octokit.search.issuesAndPullRequests({
    q: `author:${login} type:pr created:>=${sinceStr}`,
    per_page: 100,
  });
  const prsOpened = prSearch.data.total_count;
  const prsMerged = prSearch.data.items.filter(
    (pr) => pr.pull_request?.merged_at
  ).length;

  // --- Issues closed by the user ---
  const issueSearch = await octokit.search.issuesAndPullRequests({
    q: `author:${login} type:issue is:closed closed:>=${sinceStr}`,
    per_page: 100,
  });
  const issuesClosed = issueSearch.data.total_count;

  // --- Build a contiguous daily series (fills gaps with 0) ---
  const dailyActivity: DailyActivity[] = [];
  const cursor = new Date(since);
  const today = new Date();
  while (cursor <= today) {
    const key = iso(cursor);
    dailyActivity.push({ date: key, commits: dayBuckets.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  // --- Streaks (consecutive days with >=1 commit, walking backward from today) ---
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;
  for (let i = dailyActivity.length - 1; i >= 0; i--) {
    if (dailyActivity[i].commits > 0) {
      running++;
      if (i === dailyActivity.length - 1 || currentStreak === running - 1) {
        currentStreak = running;
      }
    } else {
      longestStreak = Math.max(longestStreak, running);
      running = 0;
      if (i === dailyActivity.length - 1) currentStreak = 0;
    }
  }
  longestStreak = Math.max(longestStreak, running);

  const repoBreakdown: RepoBreakdown[] = Array.from(repoBuckets.entries())
    .map(([repo, commits]) => ({ repo, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 8);

  const repositories: UserRepo[] = rawRepos.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    description: r.description,
    private: r.private,
    language: r.language ?? null,
    stargazersCount: r.stargazers_count ?? 0,
    updatedAt: r.updated_at ?? r.pushed_at ?? new Date().toISOString(),
    htmlUrl: r.html_url,
    commits90d: repoBuckets.get(r.full_name) ?? 0,
  }));

  return {
    login,
    avatarUrl,
    totalCommits: commitSearch.data.total_count,
    totalPRsOpened: prsOpened,
    totalPRsMerged: prsMerged,
    totalIssuesClosed: issuesClosed,
    currentStreak,
    longestStreak,
    dailyActivity,
    repoBreakdown,
    repositories,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchGithubStats(
  accessToken: string
): Promise<GithubStatsSummary> {
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();

  // Full repo list the user can see (owned, collaborator, org member).
  // This is what GitHub's "Top repositories" sidebar draws from — not just
  // places with recent authored commits.
  const { data: rawRepos } = await octokit.repos.listForAuthenticatedUser({
    affiliation: "owner,collaborator,organization_member",
    sort: "updated",
    per_page: 100,
  });

  return buildStatsSummary(octokit, user.login, user.avatar_url, rawRepos);
}

/**
 * Public-only variant for the "compare with a teammate" feature — no
 * access to the viewer's OAuth token for an arbitrary other user, so this
 * builds its own client (optionally with GITHUB_TOKEN for a higher rate
 * limit) and only pulls data any visitor to github.com could see:
 * public repos owned by that user, no private-repo affiliation.
 */
export async function fetchPublicGithubStats(
  username: string
): Promise<GithubStatsSummary> {
  const octokit = new Octokit(
    process.env.GITHUB_TOKEN ? { auth: process.env.GITHUB_TOKEN } : {}
  );

  const { data: user } = await octokit.users.getByUsername({ username });

  const { data: rawRepos } = await octokit.repos.listForUser({
    username,
    type: "owner",
    sort: "updated",
    per_page: 100,
  });

  return buildStatsSummary(octokit, user.login, user.avatar_url, rawRepos);
}
