import React from "react";
import { cn } from "@/lib/utils";

interface SpotlightProps {
  className?: string;
  fill?: string;
}

export function Spotlight({ className, fill = "#a8ffc1" }: SpotlightProps) {
  return (
    <svg
      className={cn(
        "pointer-events-none absolute -top-40 left-0 z-0 h-[169%] w-[138%] opacity-0 [animation:spotlight_2s_ease_0.75s_1_forwards] lg:w-[84%]",
        className
      )}
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#spotlight-blur)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          fill={fill}
          fillOpacity="0.7"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
        />
      </g>
      <defs>
        <filter
          id="spotlight-blur"
          x="0.860352"
          y="0"
          width="3785.16"
          height="2841.34"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
      <style>{`
        @keyframes spotlight {
          0% {
            opacity: 0;
            transform: translate(-72%, -62%) scale(0.5);
          }
          100% {
            opacity: 0.28;
            transform: translate(-50%, -40%) scale(1);
          }
        }
      `}</style>
    </svg>
  );
}
