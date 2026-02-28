"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  variant?: "default" | "green" | "amber" | "red";
  pulse?: boolean;
}

const variantClasses = {
  default: "from-zinc-800/50 to-zinc-900",
  green: "from-status-active/10 to-zinc-900",
  amber: "from-status-expiring/10 to-zinc-900",
  red: "from-status-expired/10 to-zinc-900",
};

export function StatCard({
  value,
  label,
  prefix = "",
  variant = "default",
  pulse = false,
}: StatCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === 0) {
      setDisplayed(0);
      return;
    }

    let start = 0;
    const duration = 800;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setDisplayed(start);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-gradient-to-b rounded-xl border border-zinc-800 p-3 min-w-[140px] shrink-0",
        variantClasses[variant],
        pulse && "animate-pulse-amber"
      )}
    >
      <p className="text-xl font-bold text-zinc-100">
        {prefix}
        {displayed.toLocaleString("en-AU")}
      </p>
      <p className="text-[11px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
