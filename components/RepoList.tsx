import type { UserRepo } from "@/lib/github";

export function RepoList({ repos }: { repos: UserRepo[] }) {
  if (repos.length === 0) {
    return (
      <div className="rounded-lg border border-base-700 bg-base-900 p-5">
        <p className="font-body text-sm text-base-400">
          No repositories found for this account. Make sure DevPulse was granted
          access to your organizations when you signed in.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-base-700 bg-base-900">
      <div className="border-b border-base-700 px-5 py-3">
        <p className="font-mono text-xs uppercase tracking-wide text-base-400">
          Your repositories · {repos.length}
        </p>
      </div>
      <ul className="divide-y divide-base-700">
        {repos.map((repo) => (
          <li key={repo.fullName}>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-base-800/50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-mono text-sm text-base-50">
                    {repo.fullName}
                  </span>
                  {repo.private && (
                    <span className="rounded border border-base-700 px-1.5 py-0.5 font-mono text-[10px] uppercase text-base-400">
                      private
                    </span>
                  )}
                </div>
                {repo.description && (
                  <p className="mt-1 line-clamp-1 font-body text-xs text-base-400">
                    {repo.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right font-mono text-xs text-base-400">
                {repo.language && <p className="text-base-300">{repo.language}</p>}
                <p className="mt-0.5">
                  {repo.commits90d > 0
                    ? `${repo.commits90d} commits · 90d`
                    : "no recent commits"}
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
