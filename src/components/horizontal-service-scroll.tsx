"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MORPHING_SERVICES } from "@/data/mad-genius-copy";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";
import { HeroGradientCanvas } from "@/components/hero-gradient-canvas";
import { ServicesCharacterStack } from "@/components/services-character-stack";

const liquidEase = (v: number) => {
  const t = Math.max(0, Math.min(1, v));
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
};

/** Hero `small-description` ile aynı hiyerarşi */
const LABEL = "text-mad-aaa-body";

function focusWeight(i: number, floatIndex: number) {
  const raw = Math.max(0, 1 - Math.abs(floatIndex - i));
  return raw * raw * (3 - 2 * raw);
}

/** Açıklama çapraz solması: ortada daha keskin el değişimi (üst üste iki metin az görünsün). */
function descFadeStrength(i: number, floatIndex: number) {
  const w = focusWeight(i, floatIndex);
  const t = liquidEase(w);
  return t * t;
}

/**
 * Pinned viewport — başlıklar yatay kayar; açıklamalar ortada sabit, scroll ile fade-out / fade-in.
 */
export function HorizontalServiceScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const activeNoRef = useRef<HTMLSpanElement>(null);

  const n = MORPHING_SERVICES.length;

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const raf = requestAnimationFrame(() => {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger);
          const section = sectionRef.current;
          const pin = pinRef.current;
          const characterRoot = characterRef.current;
          if (!section || !pin || !characterRoot) return;

          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

          let articles = Array.from(
            (stageRef.current ?? pin).querySelectorAll<HTMLElement>("[data-service-slide]")
          );
          let descEls = Array.from(pin.querySelectorAll<HTMLElement>("[data-service-desc]"));
          let charEls = Array.from(pin.querySelectorAll<HTMLElement>("[data-service-character]"));
          const debrisEls = Array.from(pin.querySelectorAll<HTMLElement>("[data-service-debris]"));
          const flickerEl = pin.querySelector<HTMLElement>("[data-service-char-flicker]");

          const recalcStageNodes = () => {
            articles = Array.from(
              (stageRef.current ?? pin).querySelectorAll<HTMLElement>("[data-service-slide]")
            );
            descEls = Array.from(pin.querySelectorAll<HTMLElement>("[data-service-desc]"));
            charEls = Array.from(pin.querySelectorAll<HTMLElement>("[data-service-character]"));
          };

          const applyFocus = (progress: number) => {
            const floatIndex = progress * Math.max(1, n - 1);
            const idx = Math.min(n - 1, Math.max(0, Math.round(floatIndex)));
            const w = stageRef.current?.clientWidth ?? pin.clientWidth;
            if (activeNoRef.current) activeNoRef.current.textContent = `NO.${String(idx + 1).padStart(2, "0")}`;
            articles.forEach((article, i) => {
              const offset = i - floatIndex;
              gsap.set(article, { x: offset * w, force3D: true });
              const wt = liquidEase(focusWeight(i, floatIndex));
              const title = article.querySelector<HTMLElement>(".service-title");
              if (title) gsap.set(title, { opacity: 0.3 + 0.7 * wt, scale: 1 + 0.04 * wt, transformOrigin: "50% 50%", force3D: true });
            });
            descEls.forEach((el, i) => {
              const o = descFadeStrength(i, floatIndex);
              gsap.set(el, { opacity: o, force3D: true });
              el.setAttribute("aria-hidden", o < 0.08 ? "true" : "false");
            });
            charEls.forEach((el, i) =>
              gsap.set(el, { opacity: descFadeStrength(i, floatIndex), force3D: true })
            );
            let crossMix = 0;
            charEls.forEach((_, i) => {
              const tw = liquidEase(focusWeight(i, floatIndex));
              crossMix += tw * (1 - tw);
            });
            if (flickerEl) gsap.set(flickerEl, { opacity: Math.min(0.2, crossMix * 0.92), force3D: true });
            gsap.set(characterRoot, {
              rotation: 0,
              scale: 1.02 + 0.05 * Math.sin(progress * Math.PI * Math.max(1, n - 1)),
              transformOrigin: "50% 50%",
              force3D: true,
            });
            debrisEls.forEach((el, i) => {
              const k = (i + 1) * 0.37;
              gsap.set(el, {
                x: Math.sin(progress * Math.PI * 2.2 + k) * (32 + i * 12),
                y: Math.cos(progress * Math.PI * 1.65 + k * 1.2) * (28 + i * 9),
                rotation: progress * 48 * (i % 2 === 0 ? 1 : -1),
                force3D: true,
              });
            });
            const breathe = 52 + 8 * Math.sin(progress * Math.PI * 2 * Math.max(1, n - 1)) + 3 * Math.sin(progress * Math.PI * 4 * Math.max(1, n - 1) + 0.6);
            const mask = `radial-gradient(ellipse 74% 72% at 50% 46%, var(--mad-mask-core) ${breathe}%, var(--mad-mask-mid) 76%, transparent 102%)`;
            characterRoot.style.maskImage = mask;
            characterRoot.style.webkitMaskImage = mask;
          };

          const ctx = gsap.context(() => {
            if (reduced) {
              gsap.set(characterRoot, { clearProps: "all" });
              characterRoot.style.maskImage = "";
              characterRoot.style.webkitMaskImage = "";
              recalcStageNodes();
              articles.forEach((article, i) => {
                gsap.set(article, { x: 0 });
                const title = article.querySelector<HTMLElement>(".service-title");
                if (title) gsap.set(title, { opacity: i === 0 ? 1 : 0, scale: 1 });
              });
              descEls.forEach((el, i) => {
                gsap.set(el, { opacity: i === 0 ? 1 : 0 });
                el.setAttribute("aria-hidden", i === 0 ? "false" : "true");
              });
              charEls.forEach((el, i) => gsap.set(el, { opacity: i === 0 ? 1 : 0 }));
              if (flickerEl) gsap.set(flickerEl, { opacity: 0 });
              debrisEls.forEach((el) => gsap.set(el, { x: 0, y: 0, rotation: 0 }));
              if (activeNoRef.current) activeNoRef.current.textContent = "NO.01";
              return;
            }

            ScrollTrigger.create({
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              pin,
              pinSpacing: true,
              scrub: 1.2,
              invalidateOnRefresh: true,
              refreshPriority: -1,
              anticipatePin: 0,
              onUpdate: (self) => applyFocus(self.progress),
              onRefresh: (self) => {
                recalcStageNodes();
                applyFocus(self.progress);
              },
            });
            requestAnimationFrame(() => applyFocus(0));
          }, section);

          cleanup = () => ctx.revert();
          scheduleScrollTriggerRefresh();
        }
      );
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [n]);

  return (
    <section
      ref={sectionRef}
      id="services"
      className="horizontal-scroll-section relative z-[25] h-[500vh] min-h-[500vh] w-full"
      aria-label="Services"
    >
      <div
        ref={pinRef}
        className="relative flex h-screen w-full flex-col overflow-hidden bg-mad-base"
      >
        <div className="pointer-events-none absolute inset-0 z-0 min-h-full">
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
            data-service-debris
            className="absolute left-[6%] top-[22%] h-14 w-14 opacity-[0.38] blur-[1.5px] sm:h-16 sm:w-16"
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
            data-service-debris
            className="absolute right-[10%] top-[30%] h-12 w-12 opacity-[0.35] blur-[1.2px] sm:h-14 sm:w-14"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full text-mad-accent" fill="currentColor" aria-hidden>
              <path d="M8 4h8l2 4v12H6V8l2-4zm4 8a2 2 0 100 4 2 2 0 000-4z" opacity="0.9" />
            </svg>
          </div>
          <div
            data-service-debris
            className="absolute bottom-[38%] left-[12%] h-11 w-11 opacity-[0.32] blur-[1.8px] sm:bottom-[40%]"
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
            data-service-debris
            className="absolute bottom-[28%] right-[14%] h-14 w-14 opacity-[0.34] blur-[1.4px] sm:h-16 sm:w-16"
          >
            <svg viewBox="0 0 24 24" className="h-full w-full text-mad-accent" fill="currentColor" aria-hidden>
              <ellipse cx="12" cy="14" rx="8" ry="6" opacity="0.85" />
              <circle cx="9" cy="9" r="2.5" />
              <circle cx="15" cy="9" r="2.5" />
            </svg>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center">
          <ServicesCharacterStack ref={characterRef} className="opacity-[0.95]" />
        </div>

        <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col">
          <header className="pointer-events-none absolute left-0 right-0 top-6 z-20 grid grid-cols-[1fr_auto_1fr] items-start gap-4 px-6 md:left-0 md:right-0 md:top-8 md:px-10">
            <p
              className={cn(
                "justify-self-start font-mono text-[11px] font-semibold uppercase tracking-[0.32em] md:text-xs",
                LABEL
              )}
            >
              Services
            </p>
            <p
              className={cn(
                "justify-self-center text-center font-mono text-[11px] font-semibold uppercase tracking-[0.28em] md:text-xs",
                LABEL
              )}
              aria-live="polite"
            >
              <span ref={activeNoRef}>NO.01</span>
            </p>
            <span className="hidden md:block" aria-hidden />
          </header>

          <div className="relative flex min-h-0 flex-1 flex-col justify-center px-0 pb-6 pt-[4.5rem] md:pb-10 md:pt-24">
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                ref={stageRef}
                className="relative min-h-0 w-full flex-1 overflow-hidden md:min-h-[min(52vh,560px)]"
              >
                {MORPHING_SERVICES.map((item) => (
                  <article
                    key={item.id}
                    data-service-slide
                    data-service-id={item.id}
                    itemScope
                    itemType="https://schema.org/Service"
                    className="will-change-transform absolute inset-0 flex flex-col items-center justify-center px-5 text-center md:px-12"
                  >
                    <meta itemProp="name" content={item.title} />
                    <meta itemProp="description" content={item.description} />
                    <meta itemProp="image" content={item.image} />
                    <h2
                      className={cn(
                        "service-title font-[family-name:var(--font-display)] font-extrabold capitalize leading-[1.02] tracking-[-0.035em]",
                        "text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(2.35rem,10.5vw,6.25rem)]",
                        "max-w-[min(94vw,980px)] text-mad-highlight",
                        "[text-shadow:var(--mad-text-shadow-service-headline)]"
                      )}
                    >
                      {item.title}
                    </h2>
                  </article>
                ))}
              </div>

              <div className="relative z-30 flex shrink-0 justify-center px-5 pb-2 md:px-12 md:pb-4">
                <div className="relative min-h-[5.5rem] w-full max-w-[min(90vw,42rem)] md:min-h-[6rem]">
                  {MORPHING_SERVICES.map((item, i) => (
                    <p
                      key={item.id}
                      data-service-desc
                      data-service-id={item.id}
                      itemProp="description"
                      className={cn(
                        "service-desc pointer-events-none absolute inset-0 flex items-center justify-center text-center font-sans text-[clamp(1.05rem,2.35vw,1.75rem)] font-normal leading-snug text-mad-aaa-body",
                        i === 0 ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden={i !== 0}
                    >
                      {item.description}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
