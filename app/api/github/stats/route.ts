import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Stats from "@/models/Stats";
import User from "@/models/User";
import { fetchGithubStats } from "@/lib/github";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  await connectDB();

  const login = session.user?.login ?? (session.user?.name as string);

  const existing = await Stats.findOne({ githubLogin: login });
  const isFresh =
    existing && Date.now() - existing.updatedAt.getTime() < CACHE_TTL_MS;

  if (existing && isFresh && !forceRefresh) {
    return NextResponse.json({ summary: existing.summary, cached: true });
  }

  try {
    const summary = await fetchGithubStats(session.accessToken);

    await Stats.findOneAndUpdate(
      { githubLogin: summary.login },
      { githubLogin: summary.login, summary, updatedAt: new Date() },
      { upsert: true }
    );

    await User.findOneAndUpdate(
      { githubLogin: summary.login },
      {
        githubLogin: summary.login,
        avatarUrl: summary.avatarUrl,
        lastSyncedAt: new Date(),
      },
      { upsert: true }
    );

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    // If GitHub rate-limits or errors, fall back to stale cache rather
    // than showing the user a blank dashboard.
    if (existing) {
      return NextResponse.json({
        summary: existing.summary,
        cached: true,
        stale: true,
      });
    }
    console.error("GitHub stats fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 502 }
    );
  }
}
