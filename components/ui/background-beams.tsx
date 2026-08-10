"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const BEAM_COUNT = 12;

function buildPaths() {
  const paths: string[] = [];
  for (let i = 0; i < BEAM_COUNT; i++) {
    const x0 = i * 90 - 340;
    const x1 = x0 + 160 + Math.sin(i) * 40;
    const y1 = 260 + Math.cos(i) * 60;
    const x2 = x0 + 520;
    const y2 = 900;
    paths.push(`M${x0} -220C${x0} -220 ${x1} ${y1} ${x2} ${y2}`);
  }
  return paths;
}

const PATHS = buildPaths();

export const BackgroundBeams = React.memo(function BackgroundBeams({
  className,
}: {
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full overflow-hidden [mask-image:radial-gradient(ellipse_at_center,white,transparent_75%)]",
        className
      )}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="-400 -220 1600 1200"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {PATHS.map((_, index) => {
            const duration = 9 + (index % 5) * 2;
            return (
              <motion.linearGradient
                id={`beam-gradient-${index}`}
                key={`beam-gradient-${index}`}
                gradientUnits="userSpaceOnUse"
                initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
                animate={
                  reduceMotion
                    ? undefined
                    : {
                        x1: ["0%", "100%"],
                        x2: ["0%", "95%"],
                        y1: ["0%", "100%"],
                        y2: ["0%", "95%"],
                      }
                }
                transition={{
                  duration,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.4,
                }}
              >
                <stop stopColor="#7ef29c" stopOpacity="0" />
                <stop stopColor="#7ef29c" />
                <stop offset="32.5%" stopColor="#9c8cf2" />
                <stop offset="100%" stopColor="#7ef29c" stopOpacity="0" />
              </motion.linearGradient>
            );
          })}
        </defs>
        {PATHS.map((path, index) => (
          <path
            key={`beam-track-${index}`}
            d={path}
            stroke="#22262d"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
        ))}
        {!reduceMotion &&
          PATHS.map((path, index) => (
            <path
              key={`beam-glow-${index}`}
              d={path}
              stroke={`url(#beam-gradient-${index})`}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
      </svg>
    </div>
  );
});
