import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * This endpoint intentionally does NOT re-fetch GitHub data itself,
 * because that would require storing long-lived user access tokens
 * server-side (a real security/compliance decision, not a shortcut).
 *
 * Instead it's a placeholder hook for a scheduled job — e.g. Vercel Cron
 * (vercel.json) or an AWS EventBridge rule calling this with the
 * CRON_SECRET header — that you can extend once you decide how you want
 * to store refresh tokens (e.g. GitHub App installation tokens instead
 * of per-user OAuth tokens, which don't expire the same way).
 */
async function handleSync(request: Request) {
  // Vercel Cron automatically sends `Authorization: Bearer $CRON_SECRET`
  // when a CRON_SECRET env var is set — supporting that here means
  // vercel.json's schedule works with zero extra config. A manual
  // `x-cron-secret` header also works for cron-job.org / EventBridge.
  const authHeader = request.headers.get("authorization");
  const cronHeader = request.headers.get("x-cron-secret");
  const bearer = authHeader?.replace("Bearer ", "");

  if (
    process.env.CRON_SECRET &&
    bearer !== process.env.CRON_SECRET &&
    cronHeader !== process.env.CRON_SECRET
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const staleUsers = await User.find({
    lastSyncedAt: { $lt: new Date(Date.now() - 60 * 60 * 1000) },
  }).select("githubLogin");

  return NextResponse.json({
    message: "Sync sweep acknowledged",
    staleUserCount: staleUsers.length,
  });
}

export { handleSync as GET, handleSync as POST };
