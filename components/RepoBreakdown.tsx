import type { RepoBreakdown as RepoBreakdownType } from "@/lib/github";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

export function RepoBreakdown({ repos }: { repos: RepoBreakdownType[] }) {
  const max = Math.max(...repos.map((r) => r.commits), 1);

  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-base-400">
        Most active repositories
      </p>
      {repos.length === 0 && (
        <p className="font-body text-sm text-base-400">
          No commits found in the last 90 days.
        </p>
      )}
      <div className="flex flex-col gap-3">
        {repos.map((r) => {
          const owner = r.repo.split("/")[0];
          return (
            <div key={r.repo}>
              <div className="mb-1 flex items-center gap-2 font-mono text-xs">
                <AnimatedTooltip
                  items={[
                    {
                      id: r.repo,
                      name: r.repo,
                      designation: `${r.commits} commit${r.commits === 1 ? "" : "s"} · 90d`,
                      image: `https://github.com/${owner}.png`,
                    },
                  ]}
                />
                <span className="truncate text-base-200">{r.repo}</span>
                <span className="tabular ml-auto text-base-400">{r.commits}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-800">
                <div
                  className="h-full rounded-full bg-pulse"
                  style={{ width: `${(r.commits / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
