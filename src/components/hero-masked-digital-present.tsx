"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const HERO_VIDEOS = [
  { src: "/videos/hero1.mp4", poster: "/madmonos.webp" },
  { src: "/videos/hero2.mp4", poster: "/madmonos.webp" },
  { src: "/videos/hero3.mp4", poster: "/madmonos.webp" },
  { src: "/videos/hero4.mp4", poster: "/madmonos.webp" },
] as const;

/**
 * Full-bleed 4-up hero: video stripes (desktop columns / mobile stacked svh rows),
 * single Montserrat wordmark over the grid; GSAP hover flex-grow on md+.
 */
export function HeroMaskedDigitalPresent() {
  const sectionRef = useRef<HTMLElement>(null);
  const colRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(true);
  const [heroInView, setHeroInView] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [videoUnlock, setVideoUnlock] = useState(false);
  const [loadedCols, setLoadedCols] = useState<boolean[]>(() => HERO_VIDEOS.map((_, i) => i === 0));
  const [failedCols, setFailedCols] = useState<boolean[]>(() => HERO_VIDEOS.map(() => false));
  const [mobileVideoPlaying, setMobileVideoPlaying] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(([e]) => setHeroInView(!!e?.isIntersecting), {
      threshold: 0,
      rootMargin: "48px 0px",
    });
    io.observe(section);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (videoUnlock) return;
    let po: PerformanceObserver | undefined;

    const unlock = () => setVideoUnlock(true);
    const onFirstInteraction = () => unlock();
    const fallbackId: number = window.setTimeout(unlock, 800);

    // Start video only after user intent or LCP to protect first paint.
    window.addEventListener("pointerdown", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true, passive: true });
    window.addEventListener("scroll", onFirstInteraction, { once: true, passive: true });

    if ("PerformanceObserver" in window) {
      try {
        po = new PerformanceObserver((list) => {
          if (list.getEntries().length > 0) unlock();
        });
        po.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // no-op
      }
    }

    return () => {
      window.clearTimeout(fallbackId);
      po?.disconnect();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
      window.removeEventListener("scroll", onFirstInteraction);
    };
  }, [videoUnlock]);

  useEffect(() => {
    if (!heroInView || !videoUnlock) return;
    let timeoutId: number | undefined;
    const idleId = window.requestIdleCallback?.(() => setHeroReady(true), { timeout: 850 });
    if (!window.requestIdleCallback) timeoutId = window.setTimeout(() => setHeroReady(true), 250);
    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [heroInView, videoUnlock]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const videos = Array.from(section.querySelectorAll<HTMLVideoElement>("video"));
    if (videos.length === 0) return;

    videos.forEach((video) => {
      if (heroInView && heroReady) {
        void video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [heroInView, heroReady, loadedCols]);

  useEffect(() => {
    const nodes = colRefs.current;
    if (nodes.length === 0) return;

    const activate = (index: number) => {
      setLoadedCols((prev) => {
        if (prev[index]) return prev;
        const next = [...prev];
        next[index] = true;
        return next;
      });
    };

    // Poster first; start media right after idle window.
    if (heroReady && heroInView) activate(0);
    if (isMobile) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!heroReady || !heroInView || !entry.isIntersecting) return;
          const index = Number((entry.target as HTMLElement).dataset.colIndex);
          if (Number.isNaN(index) || index <= 0) return;
          activate(index);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "20% 0px", threshold: 0.2 }
    );

    nodes.forEach((node, index) => {
      if (!node || index === 0) return;
      observer.observe(node);
    });

    return () => {
      observer.disconnect();
    };
  }, [heroInView, heroReady, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    let cancelled = false;
    let teardown: (() => void) | undefined;

    const rafId = requestAnimationFrame(() => {
      void (async () => {
        const section = sectionRef.current;
        if (!section || cancelled) return;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const mql = window.matchMedia("(min-width: 768px)");

        const cols = () =>
          colRefs.current.filter((n): n is HTMLDivElement => n !== null);

        const { default: gsap } = await import("gsap");
        if (cancelled) return;

        const animTargets = section.querySelectorAll<HTMLElement>(".anim-fade-in");
        if (reduced) {
          gsap.set(animTargets, { opacity: 1, y: 0 });
        } else if (animTargets.length > 0) {
          gsap.set(animTargets, { opacity: 0, y: 36 });
          gsap.to(animTargets, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            delay: 0.08,
            force3D: true,
          });
        }

        if (reduced) {
          teardown = () => {};
          return;
        }

        const resetFlex = () => {
          const c = cols();
          if (c.length !== 4) return;
          gsap.to(c, {
            flexGrow: 1,
            duration: 0.82,
            ease: "expo.out",
            overwrite: "auto",
          });
        };

        const onEnter = (i: number) => {
          if (!mql.matches) return;
          const c = cols();
          if (c.length !== 4) return;
          gsap.to(c, {
            flexGrow: (j) => (j === i ? 2.85 : 0.5),
            duration: 0.72,
            ease: "expo.out",
            overwrite: "auto",
          });
        };

        const listeners: Array<{ el: HTMLElement; type: string; fn: EventListener }> = [];

        const addListener = (el: HTMLElement, type: string, fn: EventListener) => {
          el.addEventListener(type, fn);
          listeners.push({ el, type, fn });
        };

        cols().forEach((col, i) => addListener(col, "mouseenter", () => onEnter(i)));
        addListener(section, "mouseleave", resetFlex);

        const copyHost = section.querySelector<HTMLElement>(".hero-split-copy");
        const onCopyPaneEnter = () => {
          if (mql.matches) resetFlex();
        };
        if (copyHost) addListener(copyHost, "mouseenter", onCopyPaneEnter);

        const applyMode = () => {
          if (mql.matches) resetFlex();
        };

        applyMode();
        mql.addEventListener("change", applyMode);

        teardown = () => {
          mql.removeEventListener("change", applyMode);
          listeners.forEach(({ el, type, fn }) => el.removeEventListener(type, fn));
        };
      })();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      teardown?.();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={cn(
        "main-hero relative isolate z-[5] flex w-full flex-col overflow-x-visible overflow-y-hidden",
        "[transform:translate3d(0,0,0)]"
      )}
      aria-label="Hero — madmonos"
    >
      <div
        className={cn(
          "relative w-full min-h-[100svh] md:min-h-[100svh]",
          /* Mobil: tek satır “madmonos” son harfi kesilmesin */
          "overflow-x-visible"
        )}
      >
        <div className="relative min-h-[100svh] w-full overflow-hidden md:hidden">
          {/* LCP-critical: always rendered with fetchpriority=high via next/image priority prop.
              Fades to transparent once the video starts playing. */}
          <Image
            src={HERO_VIDEOS[0].poster}
            alt=""
            fill
            sizes="100vw"
            priority
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              mobileVideoPlaying && !failedCols[0] ? "opacity-0" : "opacity-100"
            )}
            aria-hidden
          />
          {!failedCols[0] && (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={isMobile && loadedCols[0] && heroReady ? HERO_VIDEOS[0].src : undefined}
              poster={HERO_VIDEOS[0].poster}
              autoPlay={isMobile && loadedCols[0] && heroInView && heroReady}
              muted
              loop
              playsInline
              preload="metadata"
              onPlay={() => setMobileVideoPlaying(true)}
              onError={() => {
                setFailedCols((prev) => {
                  if (prev[0]) return prev;
                  const next = [...prev];
                  next[0] = true;
                  return next;
                });
              }}
              aria-hidden
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55"
            aria-hidden
          />
        </div>
        <div
          className={cn(
            "hidden w-full min-h-[100svh] md:flex md:h-[100svh] md:min-h-[100svh] md:max-h-[100svh] md:flex-row"
          )}
        >
          {HERO_VIDEOS.map((item, i) => (
            <div
              key={item.src}
              ref={(el) => {
                colRefs.current[i] = el;
              }}
              data-col-index={i}
              className={cn(
                "relative flex min-h-[100svh] w-full shrink-0 grow basis-0 flex-col overflow-hidden",
                "md:min-h-0 md:h-full md:min-w-0"
              )}
              style={{ flexGrow: 1, flexBasis: 0 }}
            >
              {failedCols[i] ? (
                <Image
                  src={item.poster}
                  alt=""
                  fill
                  sizes="25vw"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  priority={i === 0}
                  aria-hidden
                />
              ) : (
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={!isMobile && loadedCols[i] && heroReady ? item.src : undefined}
                  poster={item.poster}
                  autoPlay={!isMobile && loadedCols[i] && heroInView && heroReady}
                  muted
                  loop
                  playsInline
                  preload={i === 0 && heroReady ? "metadata" : loadedCols[i] ? "metadata" : "none"}
                  onError={() => {
                    setFailedCols((prev) => {
                      if (prev[i]) return prev;
                      const next = [...prev];
                      next[i] = true;
                      return next;
                    });
                  }}
                  aria-hidden
                />
              )}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/55 md:bg-gradient-to-r md:from-black/35 md:via-transparent md:to-black/40"
                aria-hidden
              />
            </div>
          ))}
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 z-[15] flex h-[100svh] items-center justify-center",
            "md:inset-0 md:h-full md:px-[max(1rem,env(safe-area-inset-left))] md:pr-[max(1rem,env(safe-area-inset-right))]"
          )}
        >
          <div className="flex w-full flex-col items-center px-2 text-center">
            <h1
              className={cn(
                "hero-wordmark mad-wordmark main-text heading w-full max-w-full [will-change:opacity,transform]",
                "text-[clamp(1.5rem,8vw,2.5rem)]",
                "sm:text-[clamp(1.875rem,min(10.2vw,3.35rem),3.5rem)]",
                "md:text-[clamp(2.75rem,min(18vw,22vmin),15rem)]",
                "[text-shadow:0_8px_28px_rgba(0,0,0,0.55),0_2px_10px_rgba(0,0,0,0.45)]",
                "[filter:drop-shadow(0_0_10px_rgba(10,6,12,0.36))]"
              )}
            >
              madmonos
            </h1>
            <p
              className={cn(
                "mt-3 max-w-3xl font-mono text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-mad-aaa-gold sm:text-xs sm:tracking-[0.24em] md:mt-4 md:text-sm md:tracking-[0.24em]",
                "[text-shadow:0_4px_14px_rgba(0,0,0,0.55),0_1px_6px_rgba(0,0,0,0.45)]",
                "[filter:drop-shadow(0_0_8px_rgba(10,6,12,0.32))]"
              )}
            >
              Adapting brands to the AI era. Period.
            </p>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "hero-split-copy z-[25] hidden transition-opacity duration-500 md:block",
          heroInView
            ? "pointer-events-none md:pointer-events-auto"
            : "pointer-events-none",
          heroInView ? "opacity-100" : "opacity-0",
          "fixed inset-x-0 bottom-0 md:absolute md:bottom-0 md:left-0 md:right-0"
        )}
      >
        <div
          className={cn(
            "border-t border-[color:var(--mad-border-highlight-faint)] bg-gradient-to-t from-[#0a060c]/95 via-[#0a060c]/78 to-transparent",
            "px-[max(1rem,env(safe-area-inset-left))] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4",
            "md:bg-gradient-to-t md:from-[#0a060c]/92 md:via-[#0a060c]/55 md:to-transparent md:px-10 md:pb-12 md:pt-8 lg:px-16",
            "shadow-[inset_0_1px_0_rgba(201,174,85,0.12)]"
          )}
        >
          <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 md:gap-x-16 md:gap-y-6">
            <p
              className={cn(
                "font-sans text-[clamp(1.05rem,2.1vw,1.5rem)] font-semibold leading-snug tracking-[-0.02em] text-mad-aaa-primary [text-shadow:0_2px_24px_rgba(0,0,0,0.65)]"
              )}
            >
              End-to-end marketing solutions, accelerated by AI
            </p>
            <div
              className={cn(
                "font-sans text-[clamp(0.875rem,1.5vw,1.0625rem)] font-medium leading-relaxed text-mad-aaa-body [text-shadow:0_1px_18px_rgba(0,0,0,0.55)]"
              )}
            >
              <p>
                Marketing often feels like a puzzle; we make it feel like a flow. Madmonos blends
                high-end engineering with cinematic AI creativity to handle the heavy lifting for you.
                From real-time dashboards to SEO-GEO and performance marketing, we&apos;ve removed the friction so you can focus
                entirely on the vision. No noise, no hassle-just growth that moves as fast as you do.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
