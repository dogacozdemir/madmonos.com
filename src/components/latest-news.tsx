"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { MAD_INSIGHTS } from "@/data/mad-insights";
import { cn } from "@/lib/utils";

/** Mad Insights — `#services` bitişiyle scrub’da el ele (peek + reveal). */
export function LatestNews() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const raf = requestAnimationFrame(() => {
      void (async () => {
        const section = sectionRef.current;
        const cards = cardsRef.current;
        const services = document.getElementById("services");
        if (!section || !cards || !services || cancelled) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const items = cards.querySelectorAll(".insight-card");

        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        ctx = gsap.context(() => {
          if (reduced) return;

          gsap.fromTo(
            section,
            { clipPath: "inset(0% 0% 6% 0%)", y: 20, opacity: 0.92 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              y: 0,
              opacity: 1,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: services,
                start: "bottom bottom",
                end: "bottom 55%",
                scrub: 1.2,
                invalidateOnRefresh: true,
                refreshPriority: -2,
              },
            }
          );

          gsap.fromTo(
            items,
            { y: 72, opacity: 0, rotate: 2.2 },
            {
              y: 0,
              opacity: 1,
              rotate: 0,
              force3D: true,
              stagger: { each: 0.06 },
              ease: "none",
              scrollTrigger: {
                trigger: services,
                start: "bottom 92%",
                end: "bottom 38%",
                scrub: 1.2,
                invalidateOnRefresh: true,
                refreshPriority: -2,
              },
            }
          );
        }, section);
      })();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="insights"
      className="relative z-[10] scroll-mt-[4.5rem] overflow-hidden bg-mad-mist pt-[clamp(3rem,8vh,5.5rem)] pb-12 [transform:translate3d(0,0,0)] md:pb-16"
      aria-label="Mad Insights"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <header className="relative z-[1]">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[color:var(--mad-text-insight-meta)]">
            Insights
          </p>
          <h2
            className={cn(
              "mt-3 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.5rem)] font-bold uppercase leading-[0.92] tracking-[-0.04em] text-mad-base md:text-[clamp(2.5rem,10vw,10rem)]"
            )}
          >
            Mad insights
          </h2>
        </header>

        <div
          ref={cardsRef}
          className="relative z-[1] mt-10 grid auto-rows-fr grid-cols-1 gap-8 md:mt-14 md:grid-cols-3 md:gap-x-6 md:gap-y-0 lg:gap-x-8"
        >
          {MAD_INSIGHTS.map((item) => (
            <article
              key={item.id}
              className={cn(
                "insight-card group relative flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[color:var(--mad-border-accent-soft)] bg-[color:var(--mad-surface-mist-card)] shadow-[var(--mad-shadow-insight-card)] [transform:translate3d(0,0,0)]"
              )}
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-mad-deep">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  quality={70}
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) min(40vw, 360px), (max-width: 1280px) calc((100vw - 4rem) / 3), min(480px, 33vw)"
                />
              </div>
              <div className="p-5 md:p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[color:var(--mad-text-insight-meta)] md:text-[11px]">
                  <span>{item.date}</span>
                  <span aria-hidden className="text-mad-base">
                    {" "}
                    ·{" "}
                  </span>
                  <span>{item.category}</span>
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold uppercase leading-[1.15] tracking-[-0.02em] text-mad-base md:text-2xl">
                  {item.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
