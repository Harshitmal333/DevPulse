import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  accent?: "pulse" | "amber" | "coral" | "violet";
  suffix?: string;
}

const ACCENTS: Record<NonNullable<StatCardProps["accent"]>, string> = {
  pulse: "text-pulse",
  amber: "text-signal-amber",
  coral: "text-signal-coral",
  violet: "text-signal-violet",
};

export function StatCard({ label, value, accent = "pulse", suffix }: StatCardProps) {
  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-5">
      <p className="font-mono text-xs uppercase tracking-wide text-base-400">
        {label}
      </p>
      <p className={cn("tabular mt-2 font-display text-3xl font-medium", ACCENTS[accent])}>
        {value}
        {suffix && (
          <span className="ml-1 font-body text-sm font-normal text-base-400">
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}
