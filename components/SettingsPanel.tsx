"use client";

import { useEffect, useState } from "react";

interface VisibleStats {
  commits: boolean;
  prsOpened: boolean;
  prsMerged: boolean;
  issuesClosed: boolean;
  currentStreak: boolean;
}

const DEFAULTS: VisibleStats = {
  commits: true,
  prsOpened: true,
  prsMerged: true,
  issuesClosed: true,
  currentStreak: true,
};

const LABELS: { key: keyof VisibleStats; label: string }[] = [
  { key: "commits", label: "Commits (90d)" },
  { key: "prsOpened", label: "PRs opened" },
  { key: "prsMerged", label: "PRs merged" },
  { key: "issuesClosed", label: "Issues closed" },
  { key: "currentStreak", label: "Current streak" },
];

export function SettingsPanel() {
  const [visibleStats, setVisibleStats] = useState<VisibleStats>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/preferences")
      .then((res) => res.json())
      .then((json) => setVisibleStats(json.visibleStats ?? DEFAULTS))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibleStats }),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-medium text-base-50">Settings</h1>
        <p className="font-mono text-xs text-base-400">
          Choose which stats show on your Overview dashboard
        </p>
      </div>

      <div className="max-w-md rounded-lg border border-base-700 bg-base-900 p-5">
        {loading ? (
          <p className="font-body text-sm text-base-400">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            {LABELS.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center justify-between font-body text-sm text-base-200"
              >
                {label}
                <input
                  type="checkbox"
                  checked={visibleStats[key]}
                  onChange={(e) =>
                    setVisibleStats((prev) => ({ ...prev, [key]: e.target.checked }))
                  }
                  className="h-4 w-4 accent-pulse"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="rounded-md bg-pulse px-4 py-2 font-display text-sm font-medium text-base-950 transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? "saving…" : "Save"}
        </button>
        {saved && <span className="font-mono text-xs text-pulse">saved</span>}
      </div>
    </div>
  );
}
