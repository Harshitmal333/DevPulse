"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  repeatDelay: number;
}

function makeSparkle(id: number): Sparkle {
  return {
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 1.5,
    duration: 1.1 + Math.random() * 1,
    repeatDelay: Math.random() * 2,
  };
}

interface SparklesProps {
  className?: string;
  particleColor?: string;
  particleDensity?: number;
}

export function Sparkles({
  className,
  particleColor = "#a8ffc1",
  particleDensity = 8,
}: SparklesProps) {
  const reduceMotion = useReducedMotion();
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    setSparkles(Array.from({ length: particleDensity }, (_, i) => makeSparkle(i)));
  }, [particleDensity]);

  if (reduceMotion) return null;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            backgroundColor: particleColor,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            repeatDelay: s.repeatDelay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
