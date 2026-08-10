import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/SignInButton";
import { PulseLine } from "@/components/PulseLine";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="pulse-grid flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex items-center gap-2 rounded-full border border-base-700 bg-base-900/60 px-4 py-1.5 font-mono text-xs text-pulse">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse" />
        </span>
        live signal &mdash; reads your GitHub activity in real time
      </div>

      <h1 className="mt-6 max-w-2xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-base-50 sm:text-6xl">
        Your coding activity,
        <br />
        <span className="text-pulse">as a heartbeat.</span>
      </h1>

      <p className="mt-5 max-w-md text-balance font-body text-base-400">
        Commits, pull requests, and streaks — pulled straight from GitHub and
        laid out the way a monitor reads a vital sign.
      </p>

      <div className="my-10 opacity-90">
        <PulseLine />
      </div>

      <SignInButton />

      <p className="mt-6 max-w-sm font-mono text-xs text-base-400">
        Reads public + private activity you authorize. Nothing is posted on
        your behalf.
      </p>
    </main>
  );
}
