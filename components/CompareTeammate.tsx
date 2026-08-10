"use client";

import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import type { GithubStatsSummary } from "@/lib/github";

export function CompareTeammate({ viewerSummary }: { viewerSummary: GithubStatsSummary }) {
  const [username, setUsername] = useState("");
  const [teammate, setTeammate] = useState<GithubStatsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/github/compare?username=${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Couldn't fetch that user's stats.");
      }
      setTeammate(json.summary);
    } catch (err) {
      setTeammate(null);
      setError(err instanceof Error ? err.message : "Couldn't fetch that user's stats.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="GitHub username, e.g. octocat"
          className="w-full max-w-xs rounded-md border border-base-700 bg-base-900 px-3 py-2 font-mono text-sm text-base-50 placeholder:text-base-400 focus:border-pulse"
        />
        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="rounded-md bg-pulse px-4 py-2 font-display text-sm font-medium text-base-950 transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
        >
          {loading ? "comparing…" : "Compare"}
        </button>
      </form>

      {error && <p className="font-body text-sm text-signal-coral">{error}</p>}

      {teammate && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-wide text-base-400">
              @{viewerSummary.login} (you)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Commits (90d)" value={viewerSummary.totalCommits} accent="pulse" />
              <StatCard label="PRs merged" value={viewerSummary.totalPRsMerged} accent="amber" />
              <StatCard label="Issues closed" value={viewerSummary.totalIssuesClosed} accent="coral" />
              <StatCard label="Current streak" value={viewerSummary.currentStreak} suffix="days" accent="violet" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs uppercase tracking-wide text-base-400">
              @{teammate.login}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <StatCard label="Commits (90d)" value={teammate.totalCommits} accent="pulse" />
              <StatCard label="PRs merged" value={teammate.totalPRsMerged} accent="amber" />
              <StatCard label="Issues closed" value={teammate.totalIssuesClosed} accent="coral" />
              <StatCard label="Current streak" value={teammate.currentStreak} suffix="days" accent="violet" />
            </div>
          </div>
        </div>
      )}

      {!teammate && !error && (
        <p className="font-body text-sm text-base-400">
          Paste a teammate&apos;s GitHub username to see their public stats side by side with yours.
        </p>
      )}
    </div>
  );
}
