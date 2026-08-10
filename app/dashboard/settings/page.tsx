import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SettingsShell } from "@/components/SettingsShell";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const login = (session.user as any)?.login ?? session.user?.name ?? "you";
  const avatarUrl = session.user?.image ?? "";

  return <SettingsShell login={login} avatarUrl={avatarUrl} />;
}
