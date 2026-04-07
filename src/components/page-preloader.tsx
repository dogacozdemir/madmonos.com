"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Initial load: gorilla low-poly shards stagger in (GSAP) + mad-gold 0–100% progress.
 */
export function PagePreloader() {
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const shardsRef = useRef<(SVGElement | null)[]>([]);

  const bindShard = (i: number) => (el: SVGElement | null) => {
    shardsRef.current[i] = el;
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      void (async () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shards = shardsRef.current.filter(Boolean) as SVGElement[];
        if (!shards.length) return;

        if (reduced) {
          for (const el of shards) {
            el.style.opacity = "1";
            el.style.transform = "scale(1)";
          }
          return;
        }

        const { default: gsap } = await import("gsap");
        gsap.set(shards, { opacity: 0, scale: 0.82, transformOrigin: "50% 50%" });
        gsap.to(shards, {
          opacity: 1,
          scale: 1,
          duration: 0.52,
          ease: "power3.out",
          stagger: { each: 0.065, from: "start" },
          delay: 0.1,
          force3D: true,
        });
      })();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const t0 = window.setTimeout(() => {
        setPct(100);
        requestAnimationFrame(() => setVisible(false));
      }, 0);
      return () => window.clearTimeout(t0);
    }

    let p = 0;
    const interval = window.setInterval(() => {
      p += Math.random() * 12 + 4;
      if (p > 92) p = 92;
      setPct(Math.floor(p));
    }, 130);

    const finish = () => {
      window.clearInterval(interval);
      setPct(100);
      requestAnimationFrame(() => setVisible(false));
    };

    if (document.readyState === "complete") {
      window.setTimeout(finish, 880);
    } else {
      window.addEventListener("load", () => window.setTimeout(finish, 550), { once: true });
    }

    const maxWait = window.setTimeout(finish, 4800);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(maxWait);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "fixed inset-0 z-[300] flex flex-col items-center justify-center gap-10",
        "bg-mad-base [transform:translate3d(0,0,0)]"
      )}
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading madmonos"
    >
      <div className="pointer-events-none absolute inset-0 mad-grain opacity-[0.12]" aria-hidden />

      <svg
        viewBox="0 0 120 120"
        className="h-28 w-28 shrink-0 md:h-36 md:w-36"
        aria-hidden
      >
        <defs>
          <linearGradient id="preload-g" x1="18" y1="14" x2="102" y2="106" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--mad-gold)" />
            <stop offset="0.55" stopColor="var(--mad-accent)" />
            <stop offset="1" stopColor="var(--mad-highlight)" />
          </linearGradient>
        </defs>

        <rect
          ref={bindShard(0)}
          x="10"
          y="10"
          width="100"
          height="100"
          rx="28"
          fill="var(--mad-base)"
          stroke="url(#preload-g)"
          strokeWidth="2"
        />
        <path ref={bindShard(1)} fill="url(#preload-g)" d="M60 28 L38 38 L32 52 L44 60 L58 56 Z" />
        <path ref={bindShard(2)} fill="url(#preload-g)" d="M60 28 L82 38 L88 52 L76 60 L62 56 Z" />
        <path ref={bindShard(3)} fill="url(#preload-g)" d="M32 52 L26 68 L38 82 L48 72 Z" />
        <path ref={bindShard(4)} fill="url(#preload-g)" d="M88 52 L94 68 L82 82 L72 72 Z" />
        <path ref={bindShard(5)} fill="url(#preload-g)" d="M48 72 L52 88 L60 92 L68 88 L72 72 L60 78 Z" />
        <path ref={bindShard(6)} fill="url(#preload-g)" d="M44 64 L60 70 L76 64 L70 54 L50 54 Z" />
        <circle ref={bindShard(7)} fill="var(--mad-surface-light)" cx="51" cy="50" r="4" />
        <circle ref={bindShard(8)} fill="var(--mad-surface-light)" cx="69" cy="50" r="4" />
        <path ref={bindShard(9)} fill="url(#preload-g)" d="M52 72 Q60 78 68 72 Q60 70 52 72" opacity="0.85" />
      </svg>

      <div className="flex flex-col items-center gap-2">
        <p className="font-mono text-2xl font-bold tabular-nums text-mad-gold md:text-3xl">{pct}%</p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-mad-highlight">
          Calibrating madness
        </p>
      </div>
    </div>
  );
}
