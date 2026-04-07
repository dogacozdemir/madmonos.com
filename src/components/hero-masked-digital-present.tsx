"use client";

import { useEffect, useRef } from "react";
import { HeroGradientCanvas } from "@/components/hero-gradient-canvas";
import { cn } from "@/lib/utils";

/**
 * Editorial grid hero (digitalpresent.io yapısı): üst/orta `hero__inner`, alt `hero__description` iki sütun;
 * canvas gradient arka plan, sıralı GSAP reveal, outline display tipi.
 */
export function HeroMaskedDigitalPresent() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    const raf = requestAnimationFrame(() => {
      void (async () => {
        const section = sectionRef.current;
        if (!section || cancelled) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;

        const targets = section.querySelectorAll<HTMLElement>(".anim-fade-in");
        if (targets.length === 0) return;

        const { default: gsap } = await import("gsap");
        if (cancelled) return;

        ctx = gsap.context(() => {
          gsap.set(targets, { opacity: 0, y: 40 });
          gsap.to(targets, {
            opacity: 1,
            y: 0,
            duration: 0.88,
            stagger: 0.13,
            ease: "power3.out",
            delay: 0.1,
            force3D: true,
          });
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
      id="hero"
      className={cn(
        /* overflow-x visible: tek satır “madmonos” son harfi (s) kesilmesin */
        "main-hero relative isolate z-[5] flex w-full flex-col overflow-x-visible overflow-y-hidden",
        "min-h-[100svh] min-h-[100dvh]",
        "[transform:translate3d(0,0,0)]"
      )}
      aria-label="Hero — madmonos"
    >
      <div className="pointer-events-none absolute inset-0 z-0 min-h-[100svh] min-h-[100dvh]">
        <div className="hidden h-full w-full md:block">
          <HeroGradientCanvas />
        </div>
        <div
          className="mad-hero-css-mesh absolute inset-0 h-full w-full md:hidden"
          aria-hidden
        />
        <div className="mad-hero-scrim pointer-events-none absolute inset-0" aria-hidden />
      </div>

      <div
        className={cn(
          "hero__shell relative z-[2] mx-auto flex min-h-[100svh] min-h-[100dvh] w-full max-w-[1800px] flex-1 flex-col overflow-x-visible pb-8 pt-28 sm:overflow-x-clip sm:pt-32 md:pb-12 md:pt-36",
          "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]",
          "sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))]",
          "md:px-12 lg:px-16"
        )}
      >
        <div className="hero__inner flex min-h-0 w-full max-w-full flex-1 flex-col items-center justify-center px-0.5">
          <h1
            className={cn(
              "mad-wordmark main-text heading anim-fade-in mx-auto w-full max-w-full text-center [will-change:opacity,transform]",
              /* Mobil: tam kelime sığsın (s kaybolmasın) — vw üst sınırı + sm’den sonra önceki editorial ölçek */
              "text-[clamp(1.5rem,8vw,2.5rem)]",
              "sm:text-[clamp(1.875rem,min(10.2vw,3.35rem),3.5rem)]",
              "md:text-[clamp(2.75rem,min(18vw,22svmin),15rem)]",
              "px-2 sm:px-2"
            )}
          >
            madmonos
          </h1>

          <div className="mt-6 flex w-full max-w-xl flex-col items-center gap-2 px-1 text-center md:mt-8 md:gap-2.5 md:px-0">
            <p
              className={cn(
                "small-description anim-fade-in font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-mad-aaa-body sm:text-xs sm:tracking-[0.24em] md:text-sm md:tracking-[0.24em]"
              )}
            >
              Adapting brands to the AI era. Period.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "hero__description mt-10 grid grid-cols-1 gap-8 border-t border-[color:var(--mad-border-highlight-faint)] pt-10 text-center md:mt-auto md:grid-cols-2 md:gap-x-20 md:gap-y-8 md:pt-12 md:text-left"
          )}
        >
          <p
            className={cn(
              "description-md anim-fade-in font-sans text-[clamp(1.05rem,2.1vw,1.5rem)] font-semibold leading-snug tracking-[-0.02em] text-mad-aaa-primary"
            )}
          >
            End-to-end operational solution that respects your time and money.
          </p>
          <div
            className={cn(
              "description-sm anim-fade-in font-sans text-[clamp(0.875rem,1.5vw,1.0625rem)] font-medium leading-relaxed text-mad-aaa-body [text-shadow:0_1px_16px_rgba(0,0,0,0.5)]"
            )}
          >
            <p>
              Madmonos is an AI-first marketing agency delivering frictionless, end-to-end growth.
              We combine elite technical engineering with full-spectrum performance marketing, SEO-GEO,
              and operations. Through state-of-the-art AI creative and custom real-time dashboards, we
              automate the heavy lifting to provide scalable, data-driven results with zero hassle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
