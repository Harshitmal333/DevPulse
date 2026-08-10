import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Preferences, { type IVisibleStats } from "@/models/Preferences";

const DEFAULT_VISIBLE_STATS: IVisibleStats = {
  commits: true,
  prsOpened: true,
  prsMerged: true,
  issuesClosed: true,
  currentStreak: true,
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const login = session.user?.login ?? (session.user?.name as string);
  const existing = await Preferences.findOne({ githubLogin: login });

  return NextResponse.json({
    visibleStats: existing?.visibleStats ?? DEFAULT_VISIBLE_STATS,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const visibleStats: IVisibleStats = {
    commits: Boolean(body?.visibleStats?.commits ?? true),
    prsOpened: Boolean(body?.visibleStats?.prsOpened ?? true),
    prsMerged: Boolean(body?.visibleStats?.prsMerged ?? true),
    issuesClosed: Boolean(body?.visibleStats?.issuesClosed ?? true),
    currentStreak: Boolean(body?.visibleStats?.currentStreak ?? true),
  };

  await connectDB();

  const login = session.user?.login ?? (session.user?.name as string);
  await Preferences.findOneAndUpdate(
    { githubLogin: login },
    { githubLogin: login, visibleStats, updatedAt: new Date() },
    { upsert: true }
  );

  return NextResponse.json({ visibleStats });
}
