import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title: React.ReactNode;
  description: React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-lg border border-base-700 bg-base-900 p-5 transition-colors duration-300 hover:border-pulse/40",
        className
      )}
    >
      {header}
      <div className="transition-transform duration-300 group-hover/bento:translate-x-1">
        {icon}
        <div className="mt-3 font-display text-base font-medium text-base-50">
          {title}
        </div>
        <div className="mt-1 font-body text-sm text-base-400">
          {description}
        </div>
      </div>
    </div>
  );
}
