import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { SignInButton } from "@/components/SignInButton";
import { PulseLine } from "@/components/PulseLine";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

const FEATURES = [
  {
    title: "Live commit tracking",
    description:
      "Every authored commit across every repo you can see, rolled up into a 90-day activity feed that updates as you push.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-pulse">
        <path d="M12 3v6m0 6v6M5 12h4m6 0h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Streak monitoring",
    description:
      "Current and longest streaks calculated from consecutive days with at least one commit — no more losing track in a spreadsheet.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-signal-amber">
        <path
          d="M12 2c1.5 3 4 5 4 8.5A4 4 0 0 1 8 10.5C8 8 9 6 12 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M12 22a4 4 0 0 0 4-4c0-1.5-1-2.5-1-2.5S13.5 17 12 17s-3 .5-3 .5-1 1-1 2.5a4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Team mode",
    description:
      "Paste a teammate's GitHub username and see their public stats side by side with yours — no shared access needed.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-signal-violet">
        <circle cx="8" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 20c.5-3 3-5 5.5-5s5 2 5.5 5M13.5 20c.5-3 3-5 5.5-5s2.7.6 3.5 1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Digest",
    description:
      "A quick, narrative read of your last 90 days — commits, PRs, and issues summarized in a few plain sentences.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-signal-coral">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="pulse-grid relative flex min-h-screen flex-col items-center overflow-hidden px-6 py-24 text-center">
      <Spotlight className="-top-20 left-0 md:left-1/3" fill="#a8ffc1" />
      <BackgroundBeams />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
        <div className="mb-3 flex items-center gap-2 rounded-full border border-base-700 bg-base-900/60 px-4 py-1.5 font-mono text-xs text-pulse">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-pulse" />
          </span>
          live signal &mdash; reads your GitHub activity in real time
        </div>

        <h1 className="mt-6 max-w-2xl font-display text-5xl font-medium leading-[1.05] tracking-tight text-base-50 sm:text-6xl">
          <TextGenerateEffect words="Your coding activity," />
          <br />
          <TextGenerateEffect words="as a heartbeat." className="text-pulse" />
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
      </div>

      <div className="relative z-10 mt-20 w-full max-w-4xl">
        <BentoGrid className="md:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <BentoGridItem
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </BentoGrid>
      </div>
    </main>
  );
}
