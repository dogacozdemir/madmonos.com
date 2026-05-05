"use client";

import { Fragment, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { playGoldBorderFlash } from "@/lib/mad-gold-haptic";
import { getRetainerTierByPackageId } from "@/lib/package-tier-pricing";
import { DiscoveryTrigger } from "@/components/discovery/discovery-trigger";

/* ── Types ──────────────────────────────────────────────────────────────── */

type CatId = "creative" | "performance" | "ops" | "tech" | "consulting";

type Pkg = {
  id: string;
  name: string;
  tier: string;
  /** Short commercial line (desktop grid). */
  priceLine: string;
  spotlightImage: string;
  spotlightImageAlt: string;
  delta: string[] | null;
  rows: Record<CatId, string[]>;
};

/* ── Data ───────────────────────────────────────────────────────────────── */

const CATS: { id: CatId; label: string; hl: boolean }[] = [
  { id: "creative", label: "Creative", hl: false },
  { id: "performance", label: "Performance", hl: true },
  { id: "ops", label: "Operations", hl: false },
  { id: "tech", label: "Technical", hl: true },
  { id: "consulting", label: "Consulting", hl: false },
];

const PKGS: Pkg[] = [
  {
    id: "starter",
    name: "Starter",
    tier: "Layer 01",
    priceLine: "Pilot engagement",
    spotlightImage: "/developer.webp",
    spotlightImageAlt: "Starter system tier — foundational ops and baseline coverage",
    delta: null,
    rows: {
      creative: ["6 Static · 4 Short Videos"],
      performance: ["Meta + Google Ads", "2–3 Campaigns · Remarketing"],
      ops: ["SM Management (posts + comments)", "Weekly Monitoring · Monthly Report"],
      tech: ["Pixel / GA4 Setup", "Basic Routing (no dev)"],
      consulting: ["Basic 360° Sales & Marketing Advisory"],
    },
  },
  {
    id: "growth",
    name: "Growth",
    tier: "Layer 02",
    priceLine: "Growth retainer",
    spotlightImage: "/creative.webp",
    spotlightImageAlt: "Growth system tier — elevated creative velocity",
    delta: ["+ TikTok Ads", "+ Brand Mono", "+ Funnel Analysis", "+ SEO"],
    rows: {
      creative: ["8 Static · 8 Short Videos", "Brand Mono Setup · 1ST · 1SV"],
      performance: ["Meta + Google + TikTok Ads", "5–7 Campaigns · Funnel Analysis"],
      ops: ["SM Management", "2× Weekly Optimization", "Content Plan · Monthly Strategy Call"],
      tech: ["Pixel / GA4 Setup", "Landing Routing · Funnel Guidance"],
      consulting: ["SEO", "360° Sales & Marketing Advisory"],
    },
  },
  {
    id: "scale",
    name: "Scale",
    tier: "Layer 03",
    priceLine: "Scale retainer",
    spotlightImage: "/performance.webp",
    spotlightImageAlt: "Scale system tier — performance-grade distribution",
    delta: ["+ Unlimited Campaigns", "+ GEO", "+ Animated Web", "+ 2ST · 2SV"],
    rows: {
      creative: ["12 Static · 12 Short Videos", "Brand Mono Setup · 2ST · 2SV"],
      performance: ["Meta + Google + TikTok Ads", "Unlimited Campaigns · Advanced Funnel"],
      ops: ["SM Management", "Continuous Optimization", "Content Plan · Monthly Strategy Call"],
      tech: ["Pixel / GA4 Setup", "Landing Feedback", "Animated Web Design"],
      consulting: ["SEO · GEO", "360° Sales & Marketing Advisory"],
    },
  },
  {
    id: "elite",
    name: "Elite",
    tier: "Layer 04",
    priceLine: "Partner program",
    spotlightImage: "/agent.webp",
    spotlightImageAlt: "Elite system tier — autonomous command surface",
    delta: ["+ Other Ads", "+ Retargeting", "+ Weekly Call", "+ Growth Partner"],
    rows: {
      creative: ["16 Static · 16 Short Videos", "2× Brand Mono Setup · 2ST · 2SV"],
      performance: ["Meta + Google + TikTok + Other Ads", "Unlimited Campaigns · Retargeting"],
      ops: ["SM Management", "Continuous Optimization", "Content Plan · Weekly Strategy Call"],
      tech: ["Pixel / GA4 Setup", "Landing Feedback", "Animated Web Design"],
      consulting: ["SEO · GEO · Growth Partner Model", "360° Sales & Marketing Advisory"],
    },
  },
];

const N = PKGS.length;

const CAROUSEL_GAP_PX = 16;

function flattenCoverage(pkg: Pkg): string[] {
  const lines: string[] = [];
  for (const cat of CATS) {
    lines.push(...pkg.rows[cat.id]);
  }
  return lines;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function PackagesTierSpecificationsCrawl() {
  return (
    <div id="packages-tier-specifications" className="sr-only">
      <h2>Madmonos package tiers — full specifications</h2>
      <p>
        Starter, Growth, Scale, and Elite tiers with complete coverage lines by category. This block mirrors the
        interactive packages matrix for search engines, AI systems, and assistive technologies.
      </p>
      {PKGS.map((pkg) => (
        <section key={pkg.id} aria-label={`${pkg.name} tier complete specifications`}>
          <h3>
            {pkg.name} — {pkg.tier}
          </h3>
          <p>{pkg.priceLine}</p>
          {(() => {
            const r = getRetainerTierByPackageId(pkg.id);
            return r ? <p>Published retainer anchor: {r.priceDisplay} USD.</p> : null;
          })()}
          {pkg.delta ? <p>Upgrades versus prior tier: {pkg.delta.join("; ")}.</p> : null}
          <ul>
            {flattenCoverage(pkg).map((line) => (
              <li key={`${pkg.id}-all-${line}`}>{line}</li>
            ))}
          </ul>
          {CATS.map((cat) => (
            <div key={`${pkg.id}-${cat.id}`}>
              <h4>{cat.label}</h4>
              <ul>
                {pkg.rows[cat.id].map((row) => (
                  <li key={row}>{row}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

/** Mobile-only: horizontal snap rail, GSAP 3D pivot, tier avatars, glass detail + CTA. */
function MobilePackagesGrowthStage() {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const pivotRefs = useRef<(HTMLElement | null)[]>([]);
  const featListRef = useRef<HTMLUListElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [particleFast, setParticleFast] = useState(false);
  const activeIdxRef = useRef(0);
  const prevPkgIdx = useRef(0);
  const pivotPrimed = useRef(false);
  const featAnimPrimed = useRef(false);
  const boostTimerRef = useRef<number | undefined>(undefined);
  const roiWrapRef = useRef<HTMLDivElement>(null);
  const waveGroupRef = useRef<SVGGElement>(null);
  const scrollRafRef = useRef(0);

  const scrollTo = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement | undefined;
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const onScroll = () => {
    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.children[0] as HTMLElement | undefined;
      if (!firstCard) return;
      const step = firstCard.offsetWidth + CAROUSEL_GAP_PX;
      const idx = Math.min(N - 1, Math.max(0, Math.round(track.scrollLeft / step)));
      if (idx !== activeIdxRef.current) {
        activeIdxRef.current = idx;
        setActiveIdx(idx);
        setParticleFast(true);
        if (boostTimerRef.current !== undefined) window.clearTimeout(boostTimerRef.current);
        boostTimerRef.current = window.setTimeout(() => setParticleFast(false), 620);
      }
    });
  };

  useEffect(() => {
    return () => cancelAnimationFrame(scrollRafRef.current);
  }, []);

  const meshLayers = useMemo(() => {
    const gold = 0.085 + activeIdx * 0.038;
    const orchid = 0.065 + activeIdx * 0.028;
    return {
      background:
        `radial-gradient(ellipse 115% 72% at 50% ${-6 - activeIdx * 3}%, rgba(212,175,55,${gold}) 0%, transparent 54%) , ` +
        `radial-gradient(ellipse 48% 62% at ${86 + activeIdx * 2}% 108%, rgba(156,112,178,${orchid}) 0%, transparent 56%)`,
    };
  }, [activeIdx]);

  const activePkg = PKGS[activeIdx]!;
  const featureLines = useMemo(() => flattenCoverage(activePkg), [activePkg]);

  useLayoutEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!pivotPrimed.current) {
      pivotPrimed.current = true;
      pivotRefs.current.forEach((el, i) => {
        if (!el) return;
        if (q || reducedMotion) {
          gsap.set(el, { scale: i === activeIdx ? 1 : 0.9, opacity: i === activeIdx ? 1 : 0.48 });
          return;
        }
        const is = i === activeIdx;
        gsap.set(el, {
          scale: is ? 1 : 0.88,
          rotationY: i < activeIdx ? 11 : i > activeIdx ? -11 : 0,
          z: is ? 0 : -26,
          force3D: true,
        });
      });
      return;
    }

    const from = prevPkgIdx.current;
    const dir = activeIdx > from ? 1 : activeIdx < from ? -1 : 0;
    prevPkgIdx.current = activeIdx;

    pivotRefs.current.forEach((el, i) => {
      if (!el) return;
      if (q || reducedMotion) {
        gsap.to(el, {
          scale: i === activeIdx ? 1 : 0.9,
          opacity: i === activeIdx ? 1 : 0.48,
          duration: 0.28,
          ease: "power2.out",
          overwrite: true,
        });
        return;
      }
      const isActive = i === activeIdx;
      if (isActive) {
        gsap.fromTo(
          el,
          { rotationY: dir === 0 ? 0 : dir * 16, scale: 0.84, z: -20 },
          {
            rotationY: 0,
            scale: 1,
            z: 0,
            duration: 0.56,
            ease: "power3.out",
            transformPerspective: 1200,
            force3D: true,
            overwrite: true,
          }
        );
      } else {
        gsap.to(el, {
          rotationY: i < activeIdx ? 13 : -13,
          scale: 0.86,
          z: -34,
          duration: 0.44,
          ease: "power2.out",
          transformPerspective: 1200,
          force3D: true,
          overwrite: true,
        });
      }
    });
  }, [activeIdx, reducedMotion]);

  useLayoutEffect(() => {
    const ul = featListRef.current;
    if (!ul) return;
    const items = ul.querySelectorAll("li");
    const q = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (q || reducedMotion) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    if (!featAnimPrimed.current) {
      featAnimPrimed.current = true;
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      items,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.036,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      }
    );
  }, [activeIdx, reducedMotion]);

  useLayoutEffect(() => {
    const wrap = roiWrapRef.current;
    const g = waveGroupRef.current;
    if (!wrap || !g || reducedMotion) return;

    const ctx = gsap.context(() => {
      const driftSec = Math.max(7.25, 19.5 - activeIdx * 3.35);
      const pulseSec = Math.max(0.45, 1.02 - activeIdx * 0.13);
      gsap.killTweensOf(g);
      const strokes = g.querySelectorAll(".mad-roi-sine-stroke");
      gsap.killTweensOf(strokes);
      gsap.set(g, { x: 0, force3D: true });
      gsap.to(g, {
        x: -1200,
        duration: driftSec,
        ease: "none",
        repeat: -1,
      });
      gsap.fromTo(
        strokes,
        { strokeWidth: 2, opacity: 0.28 },
        {
          strokeWidth: 2.75,
          opacity: 0.52 + activeIdx * 0.045,
          repeat: -1,
          yoyo: true,
          duration: pulseSec,
          ease: "sine.inOut",
        }
      );
    }, wrap);

    return () => {
      ctx.revert();
    };
  }, [activeIdx, reducedMotion]);

  return (
    <div
      className={cn(
        "relative z-10 flex flex-col md:hidden",
        "pb-[max(5.5rem,calc(4.25rem+env(safe-area-inset-bottom,0px)))]"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-[opacity] duration-700 ease-out"
        style={meshLayers}
        aria-hidden
      />
      <div
        className={cn(
          "mad-pkg-particle-field absolute inset-0 z-[1] opacity-[0.32] mix-blend-screen transition-[opacity] duration-500",
          particleFast && "mad-pkg-particle-field--fast opacity-[0.48]"
        )}
        aria-hidden
      />
      <div
        ref={roiWrapRef}
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[18%] z-[1] min-h-[5.5rem] overflow-hidden"
        role="img"
        aria-label="ROI growth sine wave; animation runs faster and pulses stronger on Scale and Elite tiers"
      >
        <svg
          className="absolute bottom-0 left-0 h-[5.25rem] w-[min(200%,72rem)] max-w-none [transform:translate3d(0,0,0)]"
          viewBox="0 0 2400 96"
          preserveAspectRatio="xMinYMax slice"
          aria-hidden
        >
          <g ref={waveGroupRef} className="will-change-transform [transform:translate3d(0,0,0)]">
            <path
              className="mad-roi-sine-stroke"
              fill="none"
              stroke="rgba(201,174,85,0.42)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              d="M0,52 Q300,12 600,52 T1200,52 T1800,52 T2400,52"
            />
            <path
              className="mad-roi-sine-stroke"
              fill="none"
              stroke="rgba(201,174,85,0.42)"
              strokeWidth={2}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              transform="translate(1200,0)"
              d="M0,52 Q300,12 600,52 T1200,52 T1800,52 T2400,52"
            />
          </g>
        </svg>
      </div>

      <div className="relative z-[2] px-6 pt-4">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-mad-gold/90">Growth stage · select tier</p>
        <p className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.65rem,6.2vw,2.15rem)] font-bold uppercase leading-[0.92] tracking-[0.02em] text-mad-highlight">
          Power Levels
        </p>
      </div>

      <div
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label="Package tiers — horizontal gallery"
        aria-live="polite"
        className={cn(
          "relative z-[2] mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {PKGS.map((pkg, i) => {
          const focused = i === activeIdx;
          return (
            <article
              key={pkg.id}
              ref={(el) => {
                pivotRefs.current[i] = el;
              }}
              onPointerDown={(e) => playGoldBorderFlash(e.currentTarget)}
              className={cn(
                "relative shrink-0 snap-start",
                "w-[82vw] max-w-[340px]",
                "[perspective:1200px]",
                focused ? "z-10" : "z-0",
                "rounded-t-[1.35rem] will-change-transform [transform-style:preserve-3d]",
                "min-h-[min(52vh,400px)] border",
                focused
                  ? cn("border-[color:var(--mad-gold)]/55 mad-pkg-card-shimmer")
                  : "border-white/[0.08] opacity-90"
              )}
              aria-label={pkg.name}
            >
              <div className="absolute inset-0 overflow-hidden rounded-t-[1.35rem]">
                <Image
                  src={pkg.spotlightImage}
                  alt={pkg.spotlightImageAlt}
                  fill
                  sizes="82vw"
                  className="object-cover object-center scale-105"
                  priority={i === 0}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                  style={{
                    background:
                      "linear-gradient(to top, rgb(5, 3, 8), rgba(5, 3, 8, 0.65) 50%, rgba(10, 6, 16, 0.2)), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(201,174,85,0.12), transparent 70%)",
                  }}
                />
              </div>

              <div className="relative z-[2] flex min-h-[min(52vh,400px)] flex-col justify-end p-4 pb-5">
                <div className="rounded-xl border border-white/[0.12] bg-black/25 px-3 py-2 backdrop-blur-md">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-[0.04em] text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.55)]">
                    {pkg.name}
                  </h3>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="relative z-[2] mt-4 flex justify-center gap-2 px-6" role="group" aria-label="Choose package tier">
        {PKGS.map((pkg, i) => (
          <button
            key={pkg.id}
            type="button"
            aria-label={`Go to ${pkg.name}`}
            aria-current={i === activeIdx ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              "mad-carousel-dot-hit cursor-pointer",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mad-gold"
            )}
          >
            <span
              className={cn(
                "mad-carousel-dot-hit__pill",
                i === activeIdx ? "w-6 bg-mad-gold" : "w-1.5 bg-mad-highlight/25 hover:bg-mad-highlight/45"
              )}
              aria-hidden
            />
          </button>
        ))}
      </div>

      <div className="relative z-[2] mx-4 mt-6 overflow-hidden rounded-t-[1.5rem] border border-[color:var(--mad-gold)]/25 bg-[rgba(8,5,12,0.42)] px-4 py-5 shadow-[0_28px_64px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-[rgba(8,5,12,0.36)]">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-mad-gold/50">Coverage stream · active matrix</p>
        {activePkg.delta ? (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {activePkg.delta.map((d) => (
              <span
                key={d}
                className="rounded-md border border-white/25 bg-white/10 px-2 py-1 font-mono text-[8px] font-bold uppercase tracking-wider text-white/90"
              >
                {d}
              </span>
            ))}
          </div>
        ) : null}
        <ul ref={featListRef} className="mt-4 max-h-[min(38vh,320px)] space-y-2 overflow-y-auto overscroll-y-contain pr-1 [scrollbar-width:thin]">
          {featureLines.map((item) => (
            <li
              key={`${activePkg.id}-${item}`}
              className="flex items-start gap-2 border-b border-white/[0.06] pb-2 font-mono text-[11px] leading-snug tracking-[0.02em] text-[rgba(232,214,192,0.9)] last:border-b-0 last:pb-0"
            >
              <span className="mt-0.5 shrink-0 text-[color:var(--mad-gold)]/55">▸</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <DiscoveryTrigger
          premiumGlow
          className="relative z-10 mt-6 w-full border-t border-[color:var(--mad-gold)]/15 pt-5 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
        >
          Book a Demo
        </DiscoveryTrigger>
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */

export function TypographyImpactSection() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const headerLabel =
    hoveredCol !== null ? PKGS[hoveredCol]!.name : "Compare packages · hover a column";

  return (
    <section
      id="packages"
      className="relative z-10 border-b border-[color:var(--mad-border-subtle)] bg-mad-deep pb-10 pt-14 text-mad-highlight md:border-y md:pb-12 md:pt-16"
      aria-label="Our packages"
    >
      <div className="relative flex min-h-0 w-full flex-col max-md:overflow-visible md:overflow-hidden bg-mad-deep">
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 110% 50% at 50% 0%, rgba(212,175,55,0.09) 0%, transparent 58%), " +
              "radial-gradient(ellipse 50% 65% at 88% 100%, rgba(92,47,88,0.12) 0%, transparent 55%)",
          }}
          aria-hidden
        />
        <div className="mad-grain pointer-events-none absolute inset-0 z-[1] opacity-[0.055] mix-blend-soft-light" aria-hidden />

        <div className="relative z-10 shrink-0 px-6 pt-4 md:px-12 md:pt-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.28em] text-mad-gold">Coverage Layers · 01 – 04</p>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,4.25rem)] font-bold uppercase leading-[0.88] tracking-[-0.025em] text-mad-highlight">
              Our Packages
            </h2>
            {!isMobile && (
              <span className="max-w-[min(100%,14rem)] text-right font-mono text-[11px] leading-snug text-mad-gold/65">{headerLabel}</span>
            )}
          </div>

          <div className="mt-3 hidden flex-wrap justify-end gap-3 md:flex" aria-hidden={isMobile}>
            {PKGS.map((pkg, i) => (
              <span
                key={pkg.id}
                data-active={hoveredCol === i ? "true" : "false"}
                className={cn(
                  "h-[3px] shrink-0 rounded-full transition-[width,background-color] duration-300",
                  "bg-mad-gold/20 data-[active=true]:bg-mad-gold/70",
                  "w-5 data-[active=true]:w-10"
                )}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-5 hidden min-h-0 flex-1 flex-col px-6 pb-5 md:flex md:px-12">
          <div
            role="presentation"
            className="grid flex-1 overflow-hidden rounded-xl border border-[rgba(212,175,55,0.13)] shadow-[inset_0_0_0_1px_rgba(212,175,55,0.06)] md:rounded-2xl"
            style={{
              gridTemplateColumns: `minmax(10.5rem, 16rem) repeat(${N}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(${CATS.length}, auto)`,
              gap: 0,
              alignContent: "start",
            }}
            onMouseLeave={() => setHoveredCol(null)}
          >
            <div
              aria-hidden
              className="border-b border-r border-[rgba(212,175,55,0.13)] bg-[rgba(212,175,55,0.04)] pb-3 pt-4"
            />
            {PKGS.map((pkg, pi) => (
              <div
                key={pkg.id}
                data-col={pi}
                data-active={hoveredCol === pi ? "true" : "false"}
                role="presentation"
                onMouseEnter={() => setHoveredCol(pi)}
                className={cn(
                  "border-b border-[rgba(212,175,55,0.13)] pb-3 pt-4 opacity-100",
                  pi < N - 1 && "border-r border-[rgba(212,175,55,0.13)]",
                  pi === 0 ? "pl-2 pr-3 sm:pl-2.5 sm:pr-4" : "px-3 sm:px-4",
                  "bg-[rgba(212,175,55,0.04)]",
                  "transition-[border-color,background-color,box-shadow,filter] duration-300",
                  "data-[active=true]:brightness-[1.06] data-[active=true]:[box-shadow:inset_0_0_0_1px_rgba(212,175,55,0.35),inset_0_-6px_32px_-8px_rgba(212,175,55,0.12)] data-[active=true]:[background-image:linear-gradient(180deg,rgba(212,175,55,0.14),rgba(212,175,55,0.065))]"
                )}
              >
                <h3 className="mt-0 text-center font-[family-name:var(--font-display)] text-[clamp(1.05rem,1.85vw,1.65rem)] font-bold uppercase leading-tight tracking-[0.04em] text-mad-highlight">
                  {pkg.name}
                </h3>
                <p className="mad-price-glow mt-1 text-center font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-mad-gold">
                  {pkg.priceLine}
                </p>
                <div className="mt-2 flex min-h-[1.5rem] flex-wrap justify-center gap-1">
                  {pkg.delta ? (
                    pkg.delta.map((d) => (
                      <span
                        key={d}
                        className="rounded-full border border-white/20 bg-white/10 px-2 py-[3px] font-mono text-[9px] leading-4 text-white/90"
                      >
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="font-mono text-[9px] text-mad-aaa-body/30">Baseline</span>
                  )}
                </div>
              </div>
            ))}

            {CATS.map((cat, ci) => {
              const isLast = ci === CATS.length - 1;
              return (
                <Fragment key={cat.id}>
                  <div
                    className={cn(
                      "flex min-h-[2.75rem] min-w-0 items-center justify-end border-b border-r border-[rgba(212,175,55,0.13)] py-2 pl-1 pr-2 sm:py-2.5 sm:pl-2 sm:pr-2.5",
                      cat.hl
                        ? "bg-[rgba(212,175,55,0.052)] ring-1 ring-inset ring-[rgba(212,175,55,0.12)]"
                        : "bg-[rgba(255,255,255,0.011)]",
                      isLast && "rounded-none border-b-0"
                    )}
                  >
                    <span
                      className={cn(
                        "max-w-full text-right whitespace-normal break-words font-mono text-[10px] font-bold uppercase leading-snug tracking-[0.12em] sm:text-[11px] sm:tracking-[0.14em]",
                        cat.hl ? "text-mad-gold" : "text-[rgba(180,160,140,0.65)]",
                        cat.id === "performance" && "tracking-[0.085em]"
                      )}
                      style={{ overflowWrap: "anywhere", wordBreak: "normal" }}
                    >
                      {cat.label}
                    </span>
                  </div>

                  {PKGS.map((pkg, pi) => (
                    <div
                      key={`${pkg.id}-${cat.id}`}
                      data-col={pi}
                      data-active={hoveredCol === pi ? "true" : "false"}
                      role="presentation"
                      onMouseEnter={() => setHoveredCol(pi)}
                      className={cn(
                        "flex min-h-[2.75rem] min-w-0 flex-col justify-center border-b border-[rgba(212,175,55,0.13)] py-2 opacity-100 sm:py-2.5",
                        pi < N - 1 && "border-r border-[rgba(212,175,55,0.13)]",
                        pi === 0 ? "pl-2 pr-3 sm:pl-2.5 sm:pr-3.5" : "px-3 sm:px-4",
                        isLast && "border-b-0",
                        cat.hl ? "bg-[rgba(212,175,55,0.052)] ring-1 ring-inset ring-[rgba(212,175,55,0.08)]" : "bg-[rgba(255,255,255,0.011)]",
                        "transition-[border-color,background-color,filter,box-shadow] duration-300",
                        "data-[active=true]:brightness-[1.05] data-[active=true]:[box-shadow:inset_0_0_0_1px_rgba(212,175,55,0.22)] data-[active=true]:[background-image:linear-gradient(180deg,rgba(212,175,55,0.08),transparent)] data-[active=true]:[background-blend-mode:overlay]"
                      )}
                    >
                      <ul className="flex h-full min-w-0 flex-col items-center justify-center space-y-1.5 text-center">
                        {pkg.rows[cat.id].map((item) => (
                          <li
                            key={item}
                            className={cn(
                              "w-full px-0.5 font-mono text-[13px] leading-snug md:text-[13.5px]",
                              cat.hl ? "text-mad-gold/92" : "text-[rgba(228,212,192,0.88)]"
                            )}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </Fragment>
              );
            })}
          </div>
        </div>

        <MobilePackagesGrowthStage />
        <PackagesTierSpecificationsCrawl />
      </div>
    </section>
  );
}
