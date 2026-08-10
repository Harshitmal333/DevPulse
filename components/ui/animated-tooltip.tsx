"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";

export interface AnimatedTooltipItem {
  id: string | number;
  name: string;
  designation: string;
  image: string;
}

export function AnimatedTooltip({ items }: { items: AnimatedTooltipItem[] }) {
  const reduceMotion = useReducedMotion();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const x = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 5 };
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig);
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const halfWidth = event.currentTarget.offsetWidth / 2;
    x.set(event.nativeEvent.offsetX - halfWidth);
  }

  return (
    <>
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative inline-block"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          onMouseMove={handleMouseMove}
        >
          <AnimatePresence mode="popLayout">
            {hoveredId === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                transition={{
                  type: reduceMotion ? "tween" : "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: reduceMotion ? 0 : undefined,
                }}
                style={reduceMotion ? undefined : { rotate, translateX }}
                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center rounded-md border border-base-700 bg-base-800 px-3 py-2 text-xs shadow-xl"
              >
                <span className="font-body font-medium text-base-50">{item.name}</span>
                <span className="font-mono text-[10px] text-base-400">{item.designation}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Image
            src={item.image}
            alt={item.name}
            width={28}
            height={28}
            unoptimized
            className="relative h-7 w-7 rounded-full border border-base-700 object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      ))}
    </>
  );
}
