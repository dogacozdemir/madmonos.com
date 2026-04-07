"use client";

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";

/** Closed Lissajous-style path in normalized [-1,1] space (thin-line floral geometry). */
function lissajousPath(a: number, b: number, delta: number, steps = 520) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = Math.sin(a * t + delta);
    const y = Math.sin(b * t);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(5)},${y.toFixed(5)}`;
  }
  d += "Z";
  return d;
}

export const GeometricMorph = forwardRef<HTMLDivElement, { className?: string }>(
  function GeometricMorph({ className }, ref) {
    const paths = useMemo(
      () => [
        lissajousPath(5, 4, 0),
        lissajousPath(5, 4, Math.PI / 5),
        lissajousPath(3, 8, Math.PI / 3),
      ],
      []
    );

    return (
      <div
        ref={ref}
        className={cn("pointer-events-none select-none", className)}
        aria-hidden
      >
        <svg
          viewBox="-1.2 -1.2 2.4 2.4"
          aria-hidden
          className="h-[min(92vmin,840px)] w-[min(92vmin,840px)] overflow-visible text-mad-accent"
        >
          <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                strokeWidth={0.022 - i * 0.005}
                opacity={0.32 + i * 0.2}
              />
            ))}
          </g>
        </svg>
      </div>
    );
  }
);
