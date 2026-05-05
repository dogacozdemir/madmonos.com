"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  WHAT_WE_DO_SECTION_COPY,
  WHAT_WE_DO_TRINITY_SERVICES,
} from "@/data/mad-genius-copy";
import { HeroGradientCanvas } from "@/components/hero-gradient-canvas";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";
import { useWhatWeDoScrollReveal } from "@/hooks/use-what-we-do-scroll-reveal";

function PillarCardGlyph({ kind }: { kind: "ai" | "marfor" | "growth" }) {
  const c = "text-mad-aaa-gold/90";
  if (kind === "ai") {
    return (
      <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === "marfor") {
    return (
      <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 4v4M8 8h8M7 14h10M6 20h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16l4-6 4 3 4-7 4 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function kindFor(id: string): "ai" | "marfor" | "growth" {
  if (id === "ai-creative") return "ai";
  if (id === "marfor-strategy") return "marfor";
  return "growth";
}

/**
 * Hero ↔ Team (`#projects`). Üst metin + üç hizmet kartı; tema Madmonos.
 */
export function StickySolutions() {
  const pillars = WHAT_WE_DO_TRINITY_SERVICES;
  const copy = WHAT_WE_DO_SECTION_COPY;
  const { open, isOpen } = useDiscovery();
  const sectionRef = useWhatWeDoScrollReveal();
  const bgStackRef = useRef<HTMLDivElement>(null);

  /** Services pin ile aynı debris + hafif gradient «nefesi» (`HorizontalServiceScroll` applyFocus ile hizalı). */
  useEffect(() => {
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    const raf = requestAnimationFrame(() => {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          const section = sectionRef.current;
          if (!section) return;

          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          const debrisEls = Array.from(
            section.querySelectorAll<HTMLElement>("[data-wd-bg-debris]")
          );
          const bgStack = bgStackRef.current;

          const applyBgParallax = (progress: number) => {
            debrisEls.forEach((el, i) => {
              const k = (i + 1) * 0.37;
              gsap.set(el, {
                x: Math.sin(progress * Math.PI * 2.2 + k) * (32 + i * 12),
                y: Math.cos(progress * Math.PI * 1.65 + k * 1.2) * (28 + i * 9),
                rotation: progress * 48 * (i % 2 === 0 ? 1 : -1),
                force3D: true,
              });
            });
            if (bgStack) {
              gsap.set(bgStack, {
                y: (progress - 0.5) * 36,
                scale: 1.02 + 0.035 * Math.sin(progress * Math.PI * 2),
                transformOrigin: "50% 40%",
                force3D: true,
              });
            }
          };

          ctx = gsap.context(() => {
            if (reduced) {
              debrisEls.forEach((el) => gsap.set(el, { x: 0, y: 0, rotation: 0 }));
              if (bgStack) gsap.set(bgStack, { y: 0, scale: 1, clearProps: "transform" });
              return;
            }

            ScrollTrigger.create({
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.2,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                applyBgParallax(self.progress);
              },
              onRefresh: (self) => {
                applyBgParallax(self.progress);
              },
            });
          }, section);

          scheduleScrollTriggerRefresh();
        }
      );
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
      scheduleScrollTriggerRefresh();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-[30] w-full overflow-hidden border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base py-14 [transform:translate3d(0,0,0)] md:py-[4.5rem] lg:py-20"
      aria-label="What we do"
    >
      <div
        ref={bgStackRef}
        className="pointer-events-none absolute inset-0 z-0 min-h-full will-change-transform"
      >
        <HeroGradientCanvas />
        <div className="mad-hero-scrim absolute inset-0" aria-hidden />
      </div>
      <div
        className="mad-grain pointer-events-none absolute inset-0 z-[2] opacity-[0.1] mix-blend-soft-light"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
        aria-hidden
      >
        <div
          data-wd-bg-debris
          className="absolute left-[6%] top-[22%] h-14 w-14 will-change-transform opacity-[0.38] blur-[1.5px] sm:h-16 sm:w-16"
        >
          <svg viewBox="0 0 24 24" className="h-full w-full text-mad-gold" fill="none" aria-hidden>
            <path
              d="M4 9h3l3-6 4 12 3-4h5M3 19h18"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div
          data-wd-bg-debris
          className="absolute right-[10%] top-[30%] h-12 w-12 will-change-transform opacity-[0.35] blur-[1.2px] sm:h-14 sm:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-full w-full text-mad-accent" fill="currentColor" aria-hidden>
            <path d="M8 4h8l2 4v12H6V8l2-4zm4 8a2 2 0 100 4 2 2 0 000-4z" opacity="0.9" />
          </svg>
        </div>
        <div
          data-wd-bg-debris
          className="absolute bottom-[38%] left-[12%] h-11 w-11 will-change-transform opacity-[0.32] blur-[1.8px] sm:bottom-[40%]"
        >
          <svg viewBox="0 0 24 24" className="h-full w-full text-mad-gold" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M8 10c1.5-2 6.5-2 8 0v5c-1.5 2-6.5 2-8 0v-5z"
              stroke="currentColor"
              strokeWidth="1"
            />
          </svg>
        </div>
        <div
          data-wd-bg-debris
          className="absolute bottom-[28%] right-[14%] h-14 w-14 will-change-transform opacity-[0.34] blur-[1.4px] sm:h-16 sm:w-16"
        >
          <svg viewBox="0 0 24 24" className="h-full w-full text-mad-accent" fill="currentColor" aria-hidden>
            <ellipse cx="12" cy="14" rx="8" ry="6" opacity="0.85" />
            <circle cx="9" cy="9" r="2.5" />
            <circle cx="15" cy="9" r="2.5" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 pb-16 pt-24 md:px-10 md:pb-24 md:pt-32 lg:pt-36">
        <header className="relative z-20 text-center" data-wd-reveal="header">
          <h2 className="pt-12 font-[family-name:var(--font-display)] pb-20 text-[clamp(2rem,5.85vw,3.85rem)] font-bold leading-[1.07] tracking-[-0.03em] md:pb-24 md:pt-14 lg:pb-28 lg:pt-16">
            {copy.headlineStickyLines.map(({ text, variant }) => (
              <span
                key={text}
                className={cn(
                  "block whitespace-pre-wrap first:leading-[1.08] [&:nth-child(n+2)]:mt-[0.48em]",
                  variant === "gold" ? "text-mad-aaa-gold" : "text-mad-highlight"
                )}
              >
                {text}
              </span>
            ))}
          </h2>
        </header>

        <div className="relative z-10 mt-12 grid grid-cols-1 gap-9 sm:mt-14 sm:gap-10 md:mt-16 md:grid-cols-3 md:gap-8 lg:mt-20 lg:gap-10 xl:gap-12">
          {pillars.map((item) => (
            <article
              key={item.id}
              data-wd-reveal="card"
              itemScope
              itemType="https://schema.org/Service"
              className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--mad-border-accent-faint)] bg-mad-void/35 pt-4 shadow-[var(--mad-shadow-elevated)] backdrop-blur-xl md:pt-5"
            >
              <meta itemProp="name" content={item.title} />
              <meta itemProp="description" content={item.description} />
              <meta itemProp="image" content={item.image} />

              <div className="relative aspect-[10/9] w-full overflow-hidden border-b border-[color:var(--mad-border-accent-faint)] bg-mad-deep/50">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 92vw, 33vw"
                  draggable={false}
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--mad-base)]/90 via-transparent to-transparent"
                  aria-hidden
                />
              </div>

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <PillarCardGlyph kind={kindFor(item.id)} />
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-tight tracking-[-0.02em] text-mad-highlight md:text-xl">
                    {item.title}
                  </h3>
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-mad-aaa-body md:text-[0.95rem] md:leading-[1.55]">
                  {item.description}
                </p>
                <button
                  type="button"
                  data-mad-cursor="discover"
                  aria-haspopup="dialog"
                  aria-expanded={isOpen}
                  aria-controls="discovery-modal"
                  onClick={open}
                  className="group mt-6 inline-flex w-fit items-center gap-2 text-left text-xs font-bold uppercase tracking-[0.2em] text-mad-aaa-gold transition-colors hover:text-mad-highlight"
                >
                  Learn more
                  <span
                    className="inline-block transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden
                  >
                    ↗
                  </span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
