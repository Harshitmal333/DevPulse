import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  const login = (session.user as any)?.login ?? session.user?.name ?? "you";
  const avatarUrl = session.user?.image ?? "";

  return <DashboardShell login={login} avatarUrl={avatarUrl} />;
}
