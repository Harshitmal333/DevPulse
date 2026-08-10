"use client";

import { useState } from "react";
import { Sidebar, type NavId } from "@/components/Sidebar";
import { DashboardClient } from "@/components/DashboardClient";

interface DashboardShellProps {
  login: string;
  avatarUrl: string;
}

export function DashboardShell({ login, avatarUrl }: DashboardShellProps) {
  const [activeNav, setActiveNav] = useState<NavId>("overview");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        login={login}
        avatarUrl={avatarUrl}
        active={activeNav}
        onNavigate={setActiveNav}
      />
      <main className="flex-1 overflow-y-auto p-8">
        <DashboardClient view={activeNav} />
      </main>
    </div>
  );
}
