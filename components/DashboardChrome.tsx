"use client";

import { Sidebar, type NavId } from "@/components/Sidebar";

interface DashboardChromeProps {
  login: string;
  avatarUrl: string;
  active: NavId | "settings";
  onNavigate: (id: NavId) => void;
  children: React.ReactNode;
}

export function DashboardChrome({
  login,
  avatarUrl,
  active,
  onNavigate,
  children,
}: DashboardChromeProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        login={login}
        avatarUrl={avatarUrl}
        active={active}
        onNavigate={onNavigate}
      />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
