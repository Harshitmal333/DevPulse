"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children?: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
}

export function CardSpotlight({
  children,
  radius = 300,
  color = "#7ef29c",
  className,
}: CardSpotlightProps) {
  const reduceMotion = useReducedMotion();
  const [opacity, setOpacity] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, ${color}22, transparent 80%)`;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-base-700 bg-base-900",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background }}
        animate={{ opacity }}
        transition={{ duration: reduceMotion ? 0 : 0.3 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
