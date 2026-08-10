"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/StatCard";
import { CommitChart } from "@/components/CommitChart";
import { RepoBreakdown } from "@/components/RepoBreakdown";
import { RepoList } from "@/components/RepoList";
import type { NavId } from "@/components/Sidebar";
import type { GithubStatsSummary } from "@/lib/github";

const TITLES: Record<NavId, { title: string; subtitle: string }> = {
  overview: {
    title: "Overview",
    subtitle: "Your activity across the last 90 days",
  },
  repositories: {
    title: "Repositories",
    subtitle: "Repos you own, collaborate on, or access via orgs",
  },
  streaks: {
    title: "Streaks",
    subtitle: "Consecutive days with at least one commit",
  },
  digest: {
    title: "Digest",
    subtitle: "A quick read of your recent pulse",
  },
};

export function DashboardClient({ view }: { view: NavId }) {
  const [summary, setSummary] = useState<GithubStatsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load(refresh = false) {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/github/stats${refresh ? "?refresh=true" : ""}`);
      if (!res.ok) throw new Error("Failed to load stats");
      const json = await res.json();
      setSummary(json.summary);
      setError(null);
    } catch {
      setError("Couldn't reach GitHub. Try refreshing in a moment.");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (error && !summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-display text-lg text-signal-coral">{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 rounded-md border border-base-700 px-4 py-2 font-mono text-xs text-base-200 hover:bg-base-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-3 font-mono text-sm text-base-400">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pulse" />
          </span>
          reading your activity from GitHub…
        </div>
      </div>
    );
  }

  const { title, subtitle } = TITLES[view];
  const activeDays = summary.dailyActivity.filter((d) => d.commits > 0).length;
  const topRepo = summary.repoBreakdown[0];
  const repositories = summary.repositories ?? [];
  const activeRepoCount =
    repositories.filter((r) => r.commits90d > 0).length ||
    summary.repoBreakdown.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-base-50">
            {title}
          </h1>
          <p className="font-mono text-xs text-base-400">
            {subtitle} · last synced {new Date(summary.fetchedAt).toLocaleTimeString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() => load(true)}
          disabled={refreshing}
          className="rounded-md border border-base-700 px-3 py-1.5 font-mono text-xs text-base-200 hover:bg-base-800 disabled:opacity-50"
        >
          {refreshing ? "syncing…" : "↻ refresh"}
        </button>
      </div>

      {view === "overview" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Commits (90d)" value={summary.totalCommits} accent="pulse" />
            <StatCard label="PRs opened" value={summary.totalPRsOpened} accent="violet" />
            <StatCard label="PRs merged" value={summary.totalPRsMerged} accent="amber" />
            <StatCard label="Issues closed" value={summary.totalIssuesClosed} accent="coral" />
            <StatCard label="Current streak" value={summary.currentStreak} suffix="days" accent="pulse" />
          </div>

          <CommitChart data={summary.dailyActivity} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RepoBreakdown repos={summary.repoBreakdown} />
            <div className="rounded-lg border border-base-700 bg-base-900 p-5">
              <p className="mb-4 font-mono text-xs uppercase tracking-wide text-base-400">
                Longest streak
              </p>
              <p className="font-display text-4xl font-medium text-pulse">
                {summary.longestStreak}
                <span className="ml-2 font-body text-base font-normal text-base-400">
                  days in a row
                </span>
              </p>
              <p className="mt-3 font-body text-sm text-base-400">
                Based on commits authored in the last 90 days across every repo
                GitHub lets your token see.
              </p>
            </div>
          </div>
        </>
      )}

      {view === "repositories" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              label="Repositories"
              value={repositories.length || summary.repoBreakdown.length}
              accent="pulse"
            />
            <StatCard label="With commits (90d)" value={activeRepoCount} accent="violet" />
            <StatCard label="Commits (90d)" value={summary.totalCommits} accent="amber" />
          </div>
          <RepoList repos={repositories} />
          {summary.repoBreakdown.length > 0 && (
            <RepoBreakdown repos={summary.repoBreakdown} />
          )}
        </>
      )}

      {view === "streaks" && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <StatCard
              label="Current streak"
              value={summary.currentStreak}
              suffix="days"
              accent="pulse"
            />
            <StatCard
              label="Longest streak"
              value={summary.longestStreak}
              suffix="days"
              accent="amber"
            />
            <StatCard label="Active days" value={activeDays} suffix="/ 90" accent="violet" />
          </div>
          <CommitChart data={summary.dailyActivity} />
          <p className="font-body text-sm text-base-400">
            Streaks count consecutive calendar days with at least one authored commit
            in the last 90 days.
          </p>
        </>
      )}

      {view === "digest" && (
        <div className="rounded-lg border border-base-700 bg-base-900 p-6">
          <p className="mb-4 font-mono text-xs uppercase tracking-wide text-base-400">
            90-day snapshot
          </p>
          <div className="space-y-3 font-body text-sm leading-relaxed text-base-200">
            <p>
              You authored{" "}
              <span className="font-mono text-pulse">{summary.totalCommits}</span> commits
              across{" "}
              <span className="font-mono text-pulse">
                {activeRepoCount || summary.repoBreakdown.length}
              </span>{" "}
              repositories, with activity on{" "}
              <span className="font-mono text-pulse">{activeDays}</span> days.
            </p>
            <p>
              Pull requests:{" "}
              <span className="font-mono text-signal-violet">{summary.totalPRsOpened}</span> opened,{" "}
              <span className="font-mono text-signal-amber">{summary.totalPRsMerged}</span> merged.
              Issues closed:{" "}
              <span className="font-mono text-signal-coral">{summary.totalIssuesClosed}</span>.
            </p>
            <p>
              Current streak sits at{" "}
              <span className="font-mono text-pulse">{summary.currentStreak}</span> days
              (best run:{" "}
              <span className="font-mono text-pulse">{summary.longestStreak}</span>).
              {topRepo
                ? ` Most of that energy went into ${topRepo.repo}.`
                : " No repository activity to highlight yet."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
