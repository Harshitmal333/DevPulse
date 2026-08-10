"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavId = "overview" | "repositories" | "streaks" | "digest" | "compare";

interface SidebarProps {
  login: string;
  avatarUrl: string;
  active: NavId | "settings";
  onNavigate: (id: NavId) => void;
}

const NAV: { id: NavId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "◇" },
  { id: "repositories", label: "Repositories", icon: "▤" },
  { id: "streaks", label: "Streaks", icon: "◈" },
  { id: "digest", label: "Digest", icon: "✉" },
  { id: "compare", label: "Compare", icon: "⇄" },
];

export function Sidebar({ login, avatarUrl, active, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const isSettingsActive = active === "settings" || pathname === "/dashboard/settings";

  return (
    <aside className="flex h-screen w-60 flex-col justify-between border-r border-base-700 bg-base-900 px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pulse" />
          </span>
          <span className="font-display text-lg font-medium tracking-tight">
            DevPulse
          </span>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm transition-colors ${
                  isActive
                    ? "bg-base-800 text-base-50"
                    : "text-base-400 hover:bg-base-800/60 hover:text-base-200"
                }`}
              >
                <span className="font-mono text-pulse">{item.icon}</span>
                {item.label}
              </button>
            );
          })}

          <Link
            href="/dashboard/settings"
            aria-current={isSettingsActive ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-left font-body text-sm transition-colors ${
              isSettingsActive
                ? "bg-base-800 text-base-50"
                : "text-base-400 hover:bg-base-800/60 hover:text-base-200"
            }`}
          >
            <span className="font-mono text-pulse">⚙</span>
            Settings
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3 rounded-md border border-base-700 bg-base-850 px-3 py-2.5">
        <Image
          src={avatarUrl}
          alt={login}
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-xs text-base-50">@{login}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          title="Sign out"
          className="font-mono text-xs text-base-400 hover:text-signal-coral"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}
