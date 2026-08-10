"use client";

import { useRouter } from "next/navigation";
import { DashboardChrome } from "@/components/DashboardChrome";
import { SettingsPanel } from "@/components/SettingsPanel";

interface SettingsShellProps {
  login: string;
  avatarUrl: string;
}

export function SettingsShell({ login, avatarUrl }: SettingsShellProps) {
  const router = useRouter();

  return (
    <DashboardChrome
      login={login}
      avatarUrl={avatarUrl}
      active="settings"
      onNavigate={() => router.push("/dashboard")}
    >
      <SettingsPanel />
    </DashboardChrome>
  );
}
