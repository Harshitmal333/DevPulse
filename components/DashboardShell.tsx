"use client";

import { useState } from "react";
import { type NavId } from "@/components/Sidebar";
import { DashboardChrome } from "@/components/DashboardChrome";
import { DashboardClient } from "@/components/DashboardClient";

interface DashboardShellProps {
  login: string;
  avatarUrl: string;
}

export function DashboardShell({ login, avatarUrl }: DashboardShellProps) {
  const [activeNav, setActiveNav] = useState<NavId>("overview");

  return (
    <DashboardChrome
      login={login}
      avatarUrl={avatarUrl}
      active={activeNav}
      onNavigate={setActiveNav}
    >
      <DashboardClient view={activeNav} />
    </DashboardChrome>
  );
}
