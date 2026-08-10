"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { DailyActivity } from "@/lib/github";

export function CommitChart({ data }: { data: DailyActivity[] }) {
  // Downsample to weekly-ish labels so the x-axis stays readable
  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    commits: d.commits,
  }));

  return (
    <div className="rounded-lg border border-base-700 bg-base-900 p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-base-400">
        Commit activity — last 90 days
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="commitFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ef29c" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7ef29c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#22262d" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
            axisLine={{ stroke: "#22262d" }}
            tickLine={false}
            interval={13}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
            axisLine={false}
            tickLine={false}
            width={30}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#121418",
              border: "1px solid #22262d",
              borderRadius: 8,
              fontFamily: "var(--font-jetbrains)",
              fontSize: 12,
            }}
            labelStyle={{ color: "#c9cdd3" }}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#7ef29c"
            strokeWidth={2}
            fill="url(#commitFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
