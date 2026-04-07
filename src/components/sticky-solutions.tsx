"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { DIGITAL_PRESENT_PROJECTS } from "@/data/digital-present-projects";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";
import { cn } from "@/lib/utils";
import { KineticProjectRailMobile } from "@/components/kinetic-project-rail-mobile";

const SLIDES = [...DIGITAL_PRESENT_PROJECTS];
/** Mobil: dar genişlik görseli (Lighthouse LCP); masaüstü geniş breakpoint’ler. */
const IMG_SIZES =
  "(max-width: 768px) min(40vw, 360px), (max-width: 1024px) min(90vw, 640px), (max-width: 1536px) 56vw, 900px";

/**
 * Digital Present: tek görsel panel; sağ rail aktif projeyi gösterir (scroll eşiği: viewport merkezi).
 */
export function StickySolutions() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Her `min-h-[88svh]` segmenti — görsel girişi ScrollTrigger tetikleyicisi. */
  const segmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Masaüstü (lg+) sağ rail — önce başlık / tipografi oturur. */
  const railAsideRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let disposed = false;
    let ctx: { revert: () => void } | undefined;
    let reducedMql: MediaQueryList | null = null;
    let onReducedChange: (() => void) | null = null;
    let syncRaf = 0;
    const desktopMql = window.matchMedia("(min-width: 768px)");

    const teardown = () => {
      if (syncRaf !== 0) {
        cancelAnimationFrame(syncRaf);
        syncRaf = 0;
      }
      if (reducedMql && onReducedChange) {
        reducedMql.removeEventListener("change", onReducedChange);
        reducedMql = null;
        onReducedChange = null;
      }
      ctx?.revert();
      ctx = undefined;
    };

    const bootDesktopGsap = async () => {
      const section = sectionRef.current;
      const progress = progressRef.current;
      if (!section || !progress || disposed || !desktopMql.matches) return;

      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || !desktopMql.matches) return;

      gsap.registerPlugin(ScrollTrigger);

      reducedMql = window.matchMedia("(prefers-reduced-motion: reduce)");
      const reduced = reducedMql.matches;

      const getRailTargetY = () => (window.innerHeight || 1) * 0.5;
      const HYST_ADVANTAGE_PX = 36;
      const HYST_STICK_RADIUS_PX = 64;

      const computeActiveProject = () => {
        if (disposed) return;
        if (!desktopMql.matches) return;
        const nodes = panelRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!nodes.length) return;

        const vh = window.innerHeight || 1;
        const targetY = getRailTargetY();
        let bestIdx = 0;
        let bestDist = Infinity;

        for (let i = 0; i < nodes.length; i++) {
          const r = nodes[i].getBoundingClientRect();
          if (r.bottom < -120 || r.top > vh + 120) continue;
          const panelMid = (r.top + r.bottom) / 2;
          const d = Math.abs(panelMid - targetY);
          if (d < bestDist) {
            bestDist = d;
            bestIdx = i;
          }
        }

        setActive((prev) => {
          if (bestIdx === prev) return prev;
          const prevEl = nodes[prev];
          if (!prevEl) return bestIdx;
          const pr = prevEl.getBoundingClientRect();
          const prevMid = (pr.top + pr.bottom) / 2;
          const prevDist = Math.abs(prevMid - targetY);
          if (
            prevDist < HYST_STICK_RADIUS_PX &&
            bestDist > prevDist - HYST_ADVANTAGE_PX
          ) {
            return prev;
          }
          return bestIdx;
        });
      };

      const flushSectionSync = () => {
        if (disposed) return;
        syncRaf = 0;
        computeActiveProject();
      };

      const scheduleSectionSync = () => {
        if (disposed || syncRaf !== 0) return;
        syncRaf = requestAnimationFrame(flushSectionSync);
      };

      const onSectionScrollSync = () => {
        scheduleSectionSync();
      };

      const lgMql = window.matchMedia("(min-width: 1024px)");
      const vh = window.innerHeight || 700;
      /** Sticky kilit sonrası görsel lift — viewport tabanından. */
      const imageLiftFromY = Math.min(300, Math.round(vh * 0.34));

      ctx = gsap.context(() => {
        if (!reduced && desktopMql.matches) {
          /* Önce bölüm maskesi açılır; rail (lg+) bu fazda oturur — imajlar henüz kalkmaz. */
          gsap.fromTo(
            section,
            { clipPath: "inset(0% 0% 10% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 50%",
                scrub: 0.55,
                invalidateOnRefresh: true,
                refreshPriority: 0,
              },
            }
          );

          const rail = railAsideRef.current;
          if (rail && lgMql.matches) {
            gsap.fromTo(
              rail,
              { y: 36, opacity: 0.5, force3D: true },
              {
                y: 0,
                opacity: 1,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top 48%",
                  scrub: 0.5,
                  invalidateOnRefresh: true,
                  refreshPriority: 0,
                },
              }
            );
          }

          /* Dikey ilerleme çubuğu: bölüm üstü viewport’a yaklaşınca — kilit ile uyumlu. */
          gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              force3D: true,
              transformOrigin: "top center",
              scrollTrigger: {
                trigger: section,
                start: "top 35%",
                end: "bottom bottom",
                scrub: 0.35,
                invalidateOnRefresh: true,
                refreshPriority: 0,
              },
            }
          );
        } else {
          gsap.set(progress, { scaleY: 1 });
          const rail = railAsideRef.current;
          if (rail) gsap.set(rail, { y: 0, opacity: 1 });
        }

        const segmentNodes = segmentRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!reduced && desktopMql.matches) {
          for (const seg of segmentNodes) {
            const visual = seg.querySelector<HTMLElement>("[data-project-visual-root]");
            if (!visual) continue;
            gsap.fromTo(
              visual,
              { y: imageLiftFromY, force3D: true },
              {
                y: 0,
                ease: "none",
                force3D: true,
                scrollTrigger: {
                  trigger: seg,
                  /* Segment üstü viewport üstüne oturunca = sticky kilit; sonra yukarı akış. */
                  start: "top top",
                  end: () =>
                    `+=${Math.round(Math.min(520, Math.max(280, seg.offsetHeight * 0.4)))}`,
                  scrub: 0.72,
                  invalidateOnRefresh: true,
                },
              }
            );
          }
        } else {
          for (const seg of segmentNodes) {
            const visual = seg.querySelector<HTMLElement>("[data-project-visual-root]");
            if (visual) gsap.set(visual, { y: 0 });
          }
        }

        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          invalidateOnRefresh: true,
          onUpdate: onSectionScrollSync,
          onRefresh: () => {
            scheduleSectionSync();
          },
        });
      }, section);

      requestAnimationFrame(() => {
        flushSectionSync();
      });

      onReducedChange = () => {
        if (!reducedMql || reducedMql.matches) return;
        scheduleScrollTriggerRefresh();
        requestAnimationFrame(() => {
          flushSectionSync();
        });
      };
      reducedMql.addEventListener("change", onReducedChange);
    };

    const onDesktopMq = () => {
      if (desktopMql.matches) void bootDesktopGsap();
      else teardown();
    };

    if (desktopMql.matches) void bootDesktopGsap();
    desktopMql.addEventListener("change", onDesktopMq);

    return () => {
      disposed = true;
      desktopMql.removeEventListener("change", onDesktopMq);
      teardown();
    };
  }, []);

  const n = SLIDES.length;
  const idxPad = String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-[30] border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base [transform:translate3d(0,0,0)]"
      aria-label="Selected client work and project lines"
    >
      <div className="md:hidden">
        <KineticProjectRailMobile className="border-b border-[color:var(--mad-border-accent-faint)] bg-mad-base py-10" />
      </div>

      <div className="hidden w-full max-w-[1800px] md:mx-auto md:grid lg:grid-cols-10">
        <div className="sticky-sol-column-seam relative isolate overflow-hidden lg:col-span-6 lg:border-r lg:border-[color:var(--mad-border-gold-soft)] lg:pr-3">
          <div className="sticky-sol-media-mesh pointer-events-none absolute inset-0 z-0" aria-hidden />
          <div
            className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_95%_70%_at_10%_14%,var(--mad-grad-sticky-gold-mist)_0%,transparent_58%),radial-gradient(ellipse_75%_60%_at_92%_86%,var(--mad-grad-sticky-highlight-mist)_0%,transparent_50%)]"
            aria-hidden
          />
          <div
            className="sticky-sol-media-rail-bridge pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[min(32%,10rem)] lg:block"
            aria-hidden
          />

          <div
            className="pointer-events-none absolute right-0 top-[14%] bottom-[14%] z-[5] hidden w-[2px] translate-x-1/2 lg:right-0 lg:block"
            aria-hidden
          >
            <div className="relative h-full w-full">
              <div className="absolute inset-0 rounded-full bg-[color:var(--mad-surface-panel-plum)]" />
              <div
                ref={progressRef}
                className="absolute inset-0 origin-top scale-y-0 rounded-full bg-mad-gold will-change-transform"
              />
            </div>
          </div>

          {SLIDES.map((slide, panelIndex) => (
            <div
              key={slide.id}
              ref={(el) => {
                segmentRefs.current[panelIndex] = el;
              }}
              className="relative min-h-[88svh] w-full"
            >
              <div
                ref={(el) => {
                  panelRefs.current[panelIndex] = el;
                }}
                data-sticky-sol-panel
                className={cn(
                  "sticky-sol-panel sticky top-0 z-[2] flex min-h-0 flex-col items-center justify-center px-4 py-1.5 md:px-8 md:py-2 lg:px-10 lg:py-2",
                  panelIndex === 0 && "z-[50]"
                )}
              >
                <div
                  className={cn(
                    "absolute left-4 top-6 z-[25] rounded-full border border-[color:var(--mad-border-gold-mid)] bg-[color:var(--mad-surface-panel-plum)] px-3 py-2 lg:hidden",
                    "text-[10px] font-bold uppercase tracking-[0.18em] text-mad-highlight backdrop-blur-xl",
                    "shadow-[var(--mad-shadow-chip)] [transform:translate3d(0,0,0)]"
                  )}
                >
                  <span className="text-mad-aaa-gold">{slide.id}</span>
                  <span className="text-mad-aaa-body"> · </span>
                  <span className="text-mad-aaa-body">{slide.clientCode}</span>
                </div>

                <div data-mad-cursor="view" className="relative w-full">
                  <div
                    data-project-visual-root
                    itemScope
                    itemType="https://schema.org/CreativeWork"
                    className="relative flex w-full max-w-full justify-center will-change-transform"
                    role="group"
                    aria-label={slide.imageAlt}
                    aria-details={`mad-project-${slide.id}-geo`}
                  >
                    <span itemProp="name" className="sr-only">
                      {slide.clientCode}: {slide.title}
                    </span>
                    <p itemProp="description" className="sr-only">
                      {slide.description}
                    </p>
                    <div id={`mad-project-${slide.id}-geo`} className="sr-only">
                      <p itemProp="abstract">{slide.imageAlt}</p>
                      <p itemProp="disambiguatingDescription">
                        {slide.description}
                      </p>
                    </div>
                    <div className="sticky-sol-iris-surface relative z-[1] max-w-full overflow-hidden rounded-2xl [transform:translate3d(0,0,0)]">
                      <div className="sticky-sol-card-vignette relative max-w-full overflow-hidden rounded-2xl border border-[color:var(--mad-border-gold-dim)] bg-[color:var(--mad-surface-panel-plum)] shadow-[var(--mad-shadow-elevated)]">
                        <Image
                          src={slide.image}
                          alt={slide.imageAlt}
                          width={slide.width}
                          height={slide.height}
                          sizes={IMG_SIZES}
                          quality={70}
                          className="block h-auto w-auto max-w-full"
                          draggable={false}
                          priority={panelIndex === 0}
                          fetchPriority={panelIndex === 0 ? "high" : undefined}
                          loading={panelIndex === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    </div>

                    {slide.technicalBadge ? (
                      <div className="pointer-events-none absolute right-4 top-4 z-30 rounded-full border border-[color:var(--mad-border-gold-strong)] bg-mad-deep px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mad-aaa-gold shadow-lg backdrop-blur-md md:text-[11px]">
                        {slide.technicalBadge}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside
          ref={railAsideRef}
          className="relative z-[4] hidden flex-col justify-center px-6 py-10 will-change-transform lg:sticky lg:top-0 lg:col-span-4 lg:flex lg:h-screen lg:bg-mad-base lg:px-10 lg:py-0 lg:shadow-[var(--mad-inset-rail-seam)]"
        >
          <p className="font-serif text-[10px] font-semibold not-italic tracking-wide text-mad-aaa-gold">
            Project index
          </p>
          <div className="sticky-sol-rail-copy relative mx-auto mt-8 w-full max-w-[320px] lg:mx-0 lg:mt-10 lg:max-w-none lg:min-h-[min(36rem,72svh)]">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  "transition-opacity duration-[680ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  i === active
                    ? "relative z-10 flex min-h-[inherit] flex-col opacity-100"
                    : "pointer-events-none absolute inset-0 z-0 flex min-h-[inherit] flex-col opacity-0"
                )}
                aria-hidden={i !== active}
              >
                <p className="font-mono text-sm md:text-base">
                  <span className="text-mad-aaa-gold">{slide.id}</span>
                  <span className="text-mad-aaa-body"> /{idxPad}</span>
                </p>
                <p className="mt-4 min-h-[3rem] text-xs font-bold uppercase leading-snug tracking-[0.22em] text-mad-aaa-body">
                  {slide.clientCode}
                </p>
                {/* Sabit başlık alanı: uzun/kısa başlık geçişinde üst çizgi ve divider yerleri oynamaz */}
                <div className="mt-5 flex min-h-[7.25rem] items-start md:min-h-[7.75rem] xl:min-h-[8.75rem]">
                  <h2
                    className="font-[family-name:var(--font-display)] text-3xl font-bold uppercase leading-[1.06] tracking-[-0.03em] text-mad-highlight md:text-4xl xl:text-[2.85rem]"
                  >
                    {slide.title}
                  </h2>
                </div>
                <div
                  className="mt-5 h-px max-w-[4.5rem] shrink-0 bg-[color:var(--mad-border-gold-mid)]"
                  aria-hidden
                />
                <p className="mt-5 min-h-[11.5rem] flex-1 text-sm font-semibold leading-relaxed text-mad-aaa-primary md:min-h-[12rem] md:text-base">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
