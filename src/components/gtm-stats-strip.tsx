"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  {
    id: "speed",
    target: 10,
    decimals: 0,
    afterNumber: "x",
    caption: "Production Speed",
    aria: "10x Production Speed",
  },
  {
    id: "uptime",
    target: 99.9,
    decimals: 1,
    afterNumber: "%",
    caption: "Uptime",
    aria: "99.9% Uptime",
  },
  {
    id: "gtm",
    target: 40,
    decimals: 0,
    afterNumber: "%",
    caption: "Faster GTM",
    aria: "40% Faster GTM",
  },
] as const;

/**
 * High-contrast trust strip — count-up triggers once in view.
 */
export function GtmStatsStrip() {
  const sectionRef = useRef<HTMLElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    const raf = requestAnimationFrame(() => {
      const section = sectionRef.current;
      if (!section) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        STATS.forEach((s, i) => {
          const el = valueRefs.current[i];
          if (el) {
            const n = s.decimals ? s.target.toFixed(s.decimals) : String(Math.round(s.target));
            el.textContent = `${n}${s.afterNumber}`;
          }
        });
        return;
      }

      ctx = gsap.context(() => {
        STATS.forEach((s, i) => {
          const el = valueRefs.current[i];
          if (!el) return;
          const obj = { v: 0 };
          gsap.to(obj, {
            v: s.target,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
              once: true,
            },
            onUpdate: () => {
              const n = s.decimals ? obj.v.toFixed(s.decimals) : String(Math.round(obj.v));
              el.textContent = `${n}${s.afterNumber}`;
            },
          });
        });
      }, section);
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Go-to-market proof points"
      className={cn(
        "relative z-[2] border-y border-[color:var(--mad-border-gold-strong)] bg-mad-deep",
        "py-10 md:py-12 [transform:translate3d(0,0,0)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 mad-grain-panel opacity-[0.35]" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 md:grid-cols-3 md:gap-4 md:px-8">
        {STATS.map((s, i) => (
          <div
            key={s.id}
            className="flex flex-col items-center justify-center rounded-2xl border border-[color:var(--mad-border-gold-dim)] bg-[color:var(--mad-surface-panel-plum)] px-5 py-7 text-center shadow-[var(--mad-shadow-stats-card)] backdrop-blur-md md:py-8"
          >
            <p className="sr-only">{s.aria}</p>
            <p className="font-mono text-3xl font-black tabular-nums tracking-tight text-mad-highlight md:text-4xl">
              <span
                ref={(el) => {
                  valueRefs.current[i] = el;
                }}
                aria-hidden
              >
                {s.decimals ? `0.0${s.afterNumber}` : `0${s.afterNumber}`}
              </span>
            </p>
            <p className="mt-2 text-sm font-bold uppercase tracking-[0.12em] text-mad-gold">
              {s.caption}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
