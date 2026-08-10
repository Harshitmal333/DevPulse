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

const LOOKBACK_DAYS = 90;

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Pulls a window of activity for the authenticated user and rolls it up
 * into the shape the dashboard needs. Uses the search API for commits
 * (author-scoped, cheap) rather than paging every repo's commit list.
 */
export async function fetchGithubStats(
  accessToken: string
): Promise<GithubStatsSummary> {
  const octokit = new Octokit({ auth: accessToken });

  const { data: user } = await octokit.users.getAuthenticated();
  const since = new Date();
  since.setDate(since.getDate() - LOOKBACK_DAYS);
  const sinceStr = iso(since);

  // --- Commits authored by the user, across all repos, in the window ---
  const commitSearch = await octokit.search.commits({
    q: `author:${user.login} committer-date:>=${sinceStr}`,
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
    q: `author:${user.login} type:pr created:>=${sinceStr}`,
    per_page: 100,
  });
  const prsOpened = prSearch.data.total_count;
  const prsMerged = prSearch.data.items.filter(
    (pr) => pr.pull_request?.merged_at
  ).length;

  // --- Issues closed by the user ---
  const issueSearch = await octokit.search.issuesAndPullRequests({
    q: `author:${user.login} type:issue is:closed closed:>=${sinceStr}`,
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

  // Full repo list the user can see (owned, collaborator, org member).
  // This is what GitHub's "Top repositories" sidebar draws from — not just
  // places with recent authored commits.
  const { data: rawRepos } = await octokit.repos.listForAuthenticatedUser({
    affiliation: "owner,collaborator,organization_member",
    sort: "updated",
    per_page: 100,
  });

  const repositories: UserRepo[] = rawRepos.map((r) => ({
    fullName: r.full_name,
    name: r.name,
    description: r.description,
    private: r.private,
    language: r.language ?? null,
    stargazersCount: r.stargazers_count,
    updatedAt: r.updated_at ?? r.pushed_at ?? new Date().toISOString(),
    htmlUrl: r.html_url,
    commits90d: repoBuckets.get(r.full_name) ?? 0,
  }));

  return {
    login: user.login,
    avatarUrl: user.avatar_url,
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
