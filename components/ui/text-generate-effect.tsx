"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  duration?: number;
  filter?: boolean;
}

export function TextGenerateEffect({
  words,
  className,
  duration = 0.5,
  filter = true,
}: TextGenerateEffectProps) {
  const reduceMotion = useReducedMotion();
  const wordList = words.split(" ");

  return (
    <span className={cn("inline", className)}>
      {wordList.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          initial={reduceMotion ? { opacity: 1, filter: "none" } : { opacity: 0, filter: filter ? "blur(8px)" : "none" }}
          animate={{ opacity: 1, filter: "none" }}
          transition={{
            duration: reduceMotion ? 0 : duration,
            delay: reduceMotion ? 0 : index * 0.1,
            ease: "easeOut",
          }}
        >
          {word}
          {index < wordList.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </span>
  );
}
