import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Stats from "@/models/Stats";
import { fetchPublicGithubStats } from "@/lib/github";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  await connectDB();

  // Reuses the same generic Stats cache as /api/github/stats, keyed by
  // githubLogin — deliberately does NOT touch the User collection, which
  // represents actual signed-in app users and is swept by
  // /api/github/sync.
  const existing = await Stats.findOne({ githubLogin: username });
  const isFresh =
    existing && Date.now() - existing.updatedAt.getTime() < CACHE_TTL_MS;

  if (isFresh) {
    return NextResponse.json({ summary: existing.summary, cached: true });
  }

  try {
    const summary = await fetchPublicGithubStats(username);

    await Stats.findOneAndUpdate(
      { githubLogin: summary.login },
      { githubLogin: summary.login, summary, updatedAt: new Date() },
      { upsert: true }
    );

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    if (existing) {
      return NextResponse.json({
        summary: existing.summary,
        cached: true,
        stale: true,
      });
    }
    if (typeof err === "object" && err !== null && "status" in err && err.status === 404) {
      return NextResponse.json(
        { error: "GitHub user not found" },
        { status: 404 }
      );
    }
    console.error("GitHub compare fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch GitHub stats" },
      { status: 502 }
    );
  }
}
