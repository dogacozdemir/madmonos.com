"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Activity, Box, Rocket, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

type PackageItem = {
  id: string;
  name: string;
  tier: string;
  features: string[];
  deltaNote: string;
  deltaLines: string[];
  icon: typeof Shield;
  quadrant: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const PACKAGES: PackageItem[] = [
  {
    id: "starter",
    name: "Starter",
    tier: "Coverage Layer 01",
    features: [
      "Creative: 6 Static + 4 Short Video",
      "Performance: Meta + Google Ads, 2-3 Campaigns, Remarketing",
      "Operations: Basic SM Management + Weekly Control + Monthly Report",
      "Technical: Pixel / GA4 Setup + Simple Routing (No Dev)",
      "Consulting: Basic 360 Sales & Marketing Guidance",
    ],
    deltaNote: "Starter is the baseline package.",
    deltaLines: ["+ Base Creative Core", "+ Base Performance Core"],
    icon: Shield,
    quadrant: "top-left",
  },
  {
    id: "growth",
    name: "Growth",
    tier: "Coverage Layer 02",
    features: [
      "Creative: 8 Static + 8 Short Video + Brand Mono Setup",
      "Performance: Meta + Google + TikTok, 5-7 Campaigns + Funnel Analysis",
      "Operations: SM Management + Weekly Optimization + Strategy Call",
      "Technical: Pixel / GA4 Setup + Landing Routing + Basic Funnel Guidance",
      "Consulting: SEO + 360 Sales & Marketing Guidance",
    ],
    deltaNote: "Growth adds capacity over Starter.",
    deltaLines: ["+2 Static", "+4 Short Video", "+ TikTok + Funnel Layer"],
    icon: Rocket,
    quadrant: "top-right",
  },
  {
    id: "scale",
    name: "Scale",
    tier: "Coverage Layer 03",
    features: [
      "Creative: 12 Static + 12 Short Video + Brand Mono Extended",
      "Performance: Meta + Google + TikTok, Unlimited Campaigns + Creative Testing",
      "Operations: SM Management + Continuous Optimization + Dashboard Access",
      "Technical: Pixel / GA4 + Landing Feedback + Animated Web Design",
      "Consulting: SEO + GEO + 360 Sales & Marketing Guidance",
    ],
    deltaNote: "Scale expands over Growth.",
    deltaLines: ["+4 Static", "+4 Short Video", "+ Unlimited Campaigns"],
    icon: Activity,
    quadrant: "bottom-left",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "Coverage Layer 04",
    features: [
      "Creative: 16 Static + 16 Short Video + Dual Brand Mono Setup",
      "Performance: Multi-Channel Ads + Unlimited Campaigns + Retargeting",
      "Operations: Continuous Optimization + Weekly Strategy Calls",
      "Technical: Animated Web Design + File-Based SEO/GEO + Integrations",
      "Consulting: Growth Partner Model + 360 Sales & Marketing Guidance",
    ],
    deltaNote: "MarFor extends Scale to enterprise depth.",
    deltaLines: ["+4 Static", "+4 Short Video", "+ Retargeting + Growth Partner"],
    icon: Box,
    quadrant: "bottom-right",
  },
] as const;

const terminalLinesFromFeatures = (pkg: PackageItem, index: number) => {
  if (index === 0) {
    return [
      `> Initializing ${pkg.name}_Ops...`,
      `> Baseline layer online.`,
      ...pkg.deltaLines.map((line) => `> ${line}`),
      `> ${pkg.name}_Ops :: READY`,
    ];
  }

  const prevName = PACKAGES[index - 1]?.name ?? "Previous";
  return [
    `> Comparing ${pkg.name} vs ${prevName}...`,
    `> ${pkg.deltaNote}`,
    ...pkg.deltaLines.map((line) => `> ${line}`),
    `> Delta map synced.`,
  ];
};

export function TypographyImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const eliteRef = useRef<HTMLHeadingElement>(null);
  const enginesRef = useRef<HTMLHeadingElement>(null);
  const gridLayerRef = useRef<HTMLDivElement>(null);
  const fogLayerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const terminalRefs = useRef<(HTMLPreElement | null)[]>([]);
  const mobileRailRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const packageTerminals = useMemo(
    () => PACKAGES.map((pkg, index) => terminalLinesFromFeatures(pkg, index).join("\n")),
    []
  );

  const scrollMobileRailBy = (dir: "left" | "right") => {
    const rail = mobileRailRef.current;
    if (!rail) return;
    const delta = Math.round(rail.clientWidth * 0.84) * (dir === "left" ? -1 : 1);
    rail.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const elite = eliteRef.current;
    const engines = enginesRef.current;
    const gridLayer = gridLayerRef.current;
    const fogLayer = fogLayerRef.current;
    const core = coreRef.current;
    if (!section || !stage || !elite || !engines || !gridLayer || !fogLayer || !core) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(reduced);
    if (reduced || isMobile) {
      terminalRefs.current.forEach((terminal, index) => {
        if (terminal) terminal.textContent = packageTerminals[index];
      });
      return;
    }

    let rafId = 0;
    let targetProgress = 0;
    let frameProgress = 0;
    const cardMetrics: Array<{ width: number; height: number }> = [];

    const recalcCardMetrics = () => {
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        cardMetrics[index] = {
          width: card.clientWidth || 280,
          height: card.clientHeight || 448,
        };
      });
    };

    const ctx = gsap.context(() => {
      const motionHeavyAllowed = !window.matchMedia("(max-width: 767px)").matches;
      if (motionHeavyAllowed) {
        gsap.to(gridLayer, {
          xPercent: 1.8,
          yPercent: -1.2,
          duration: 16,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(fogLayer, {
          xPercent: 3,
          yPercent: -2,
          duration: 12,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      const setFrame = (t: number) => {
        const progress = gsap.utils.clamp(0, 1, t);
        const viewportW = window.innerWidth;
        const isNarrow = viewportW < 760;
        const isMedium = viewportW >= 760 && viewportW < 1180;
        const revealStart = 0.12;
        const reveal = gsap.utils.clamp(0, 1, (progress - revealStart) / (1 - revealStart));
        const blast = gsap.parseEase("expo.out")(reveal);
        const depth = -1200 + 1260 * blast;

        elite.style.transform = `translate3d(${-130 * progress}px, ${-20 * progress}px, 0)`;
        engines.style.transform = `translate3d(${130 * progress}px, ${20 * progress}px, 0)`;
        gridLayer.style.opacity = String(0.72 + progress * 0.16);
        fogLayer.style.opacity = String(0.38 + progress * 0.2);
        const coreFade = 1 - gsap.utils.clamp(0, 1, (progress - 0.02) * 4.4);
        const coreScale = 0.72 + gsap.utils.clamp(0, 1, progress * 3.2) * 2.1;
        const coreGlow = gsap.utils.clamp(0, 1, (progress - 0.03) / 0.18);
        core.style.opacity = String(coreFade);
        core.style.backgroundColor = "var(--mad-surface-panel-plum)";
        core.style.boxShadow = `0 0 ${14 + coreGlow * 24}px rgba(92,47,88,${0.14 + coreGlow * 0.46}), 0 0 ${36 + coreGlow * 52}px rgba(74,38,80,${0.08 + coreGlow * 0.3})`;
        core.style.transform = `translate3d(-50%, -50%, 0) scale(${coreScale})`;

        PACKAGES.forEach((pkg, index) => {
          const card = cardRefs.current[index];
          const terminal = terminalRefs.current[index];
          if (!card) return;

          const layout = isNarrow
            ? [
                [0, -1.2],
                [0, -0.4],
                [0, 0.4],
                [0, 1.2],
              ]
            : isMedium
              ? [
                  [-1.55, -0.45],
                  [-0.5, 0.45],
                  [0.5, -0.45],
                  [1.55, 0.45],
                ]
              : [
                  [-2.05, 0],
                  [-0.7, 0],
                  [0.7, 0],
                  [2.05, 0],
                ];

          const [xSlot, ySlot] = layout[index] ?? [0, 0];
          const localReveal = isNarrow
            ? gsap.utils.clamp(0, 1, (reveal - index * 0.17) / 0.36)
            : reveal;
          const localBlast = gsap.parseEase("expo.out")(localReveal);
          const stageWidth = stage.clientWidth;
          const stageHeight = stage.clientHeight;
          const totalCards = PACKAGES.length;
          const cardWidth = cardMetrics[index]?.width ?? 280;
          const cardHeight = cardMetrics[index]?.height ?? 448;
          const sidePadding = 10;
          const gapFloor = isMedium ? 14 : 20;
          const usableWidth = Math.max(0, stageWidth - sidePadding * 2);
          const requiredWidth = cardWidth * totalCards + gapFloor * Math.max(1, totalCards - 1);
          const fitScale = !isNarrow && requiredWidth > usableWidth ? usableWidth / requiredWidth : 1;
          const visualCardWidth = cardWidth * fitScale;
          const equalGap = !isNarrow
            ? Math.max(gapFloor, (usableWidth - visualCardWidth * totalCards) / Math.max(1, totalCards - 1))
            : 0;
          const centerToCenter = visualCardWidth + equalGap;
          const equalSlot = index - (totalCards - 1) / 2;
          const equalX = equalSlot * centerToCenter;
          const rawTx = isNarrow
            ? (index % 2 === 0 ? -1 : 1) * (1 - localReveal) * 22
            : gsap.utils.interpolate(0, equalX, localBlast);
          const rawTy = isNarrow
            ? ySlot * (36 + localBlast * 118)
            : ySlot * (54 + localBlast * 72);
          const maxX = Math.max(0, stageWidth * 0.5 - visualCardWidth * 0.5 - 8);
          const maxY = Math.max(0, stageHeight * 0.5 - cardHeight * 0.5 - 8);
          const tx = gsap.utils.clamp(-maxX, maxX, rawTx);
          const ty = gsap.utils.clamp(-maxY, maxY, rawTy);
          const rotateY = xSlot * (9 - progress * 6);
          const rotateX = ySlot * (-6 + localReveal * 4);
          const scale = Math.max(0.0001, localBlast * fitScale);
          const opacity = gsap.utils.clamp(0, 1, localBlast * 1.25);
          card.style.opacity = `${opacity}`;
          card.style.transform = `translate3d(${tx}px, ${ty}px, ${depth}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;

          if (terminal) {
            const terminalProgress = gsap.utils.clamp(0, 1, (progress - index * 0.12) / 0.9);
            const sample = packageTerminals[index];
            const charCount = Math.floor(sample.length * terminalProgress);
            const blinking =
              terminalProgress < 1 && Math.floor(performance.now() / 350) % 2 === 0 ? "_" : "";
            terminal.textContent = sample.slice(0, charCount) + blinking;
          }
        });
      };

      const rafLoop = () => {
        frameProgress += (targetProgress - frameProgress) * 0.16;
        setFrame(frameProgress);
        rafId = window.requestAnimationFrame(rafLoop);
      };
      rafId = window.requestAnimationFrame(rafLoop);

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetProgress = self.progress;
        },
        onRefresh: (self) => {
          recalcCardMetrics();
          targetProgress = self.progress;
          frameProgress = self.progress;
          setFrame(self.progress);
        },
      });
      recalcCardMetrics();
      targetProgress = trigger.progress;
      frameProgress = trigger.progress;
      setFrame(trigger.progress);
    }, section);

    return () => {
      window.cancelAnimationFrame(rafId);
      ctx.revert();
    };
  }, [isMobile, packageTerminals]);

  return (
    <section
      ref={sectionRef}
      id="packages"
      className="relative overflow-clip border-y border-[color:var(--mad-border-subtle)] bg-mad-deep text-mad-highlight md:min-h-[250vh]"
      aria-label="Holografik Paket Sahnesi"
    >
      <div
        className={cn(
          "flex w-full items-center justify-center overflow-hidden px-[max(1rem,env(safe-area-inset-left))] sm:px-[max(1.5rem,env(safe-area-inset-left))] md:sticky md:top-0 md:min-h-screen md:px-10 lg:px-12",
          reducedMotion ? "py-12" : "py-10 md:py-0"
        )}
      >
        <div
          ref={gridLayerRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(120% 95% at 50% 10%, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 30%, rgba(26,16,12,0.18) 58%, rgba(16,10,8,0.95) 100%), linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 35%), linear-gradient(90deg, rgba(212,175,55,0.04), transparent 35%, transparent 65%, rgba(212,175,55,0.04))",
            backgroundSize: "100% 100%, 100% 60%, 100% 100%",
            backgroundPosition: "50% 50%, 50% 0%, 50% 50%",
          }}
          aria-hidden
        />
        <div
          ref={fogLayerRef}
          className="pointer-events-none absolute inset-[-10%] z-[1] opacity-70 [filter:blur(74px)]"
          style={{
            background:
              "radial-gradient(circle at 35% 55%, rgba(193,150,103,0.2), transparent 52%), radial-gradient(circle at 72% 40%, rgba(126,94,62,0.16), transparent 48%), radial-gradient(circle at 50% 76%, rgba(90,65,42,0.12), transparent 54%)",
          }}
          aria-hidden
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-28 bg-gradient-to-b from-mad-void/60 to-transparent" aria-hidden />
        <div className="pointer-events-none absolute left-1/2 top-[14%] z-[4] w-full max-w-[560px] -translate-x-1/2 px-6 text-center">
        </div>
        <div
          ref={coreRef}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[5] hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full opacity-100 md:block"
          aria-hidden
        >
          <Image
            src="/logo-nav.webp"
            alt=""
            fill
            className="object-contain object-center"
            sizes="36px"
            priority={false}
          />
        </div>

        <h2
          ref={eliteRef}
          className={cn(
            "pointer-events-none absolute left-0 top-0 z-[3] max-w-[min(90vw,14ch)] p-6 sm:p-8 md:max-w-[55%] md:p-10 lg:p-12",
            "will-change-transform [transform:translate3d(0,0,0)]",
            "font-[family-name:var(--font-display)] font-light uppercase leading-[0.92] tracking-[0.06em]",
            "max-md:text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(4rem,10vw,12rem)]",
            "[-webkit-text-stroke:1px_var(--mad-text-stroke-beautiful)] [-webkit-text-fill-color:transparent]"
          )}
        >
          OUR
        </h2>

        <h2
          ref={enginesRef}
          className={cn(
            "pointer-events-none absolute bottom-0 right-0 z-[3] max-w-[min(90vw,14ch)] p-6 text-right sm:p-8 md:max-w-[55%] md:p-10 lg:p-12",
            "will-change-transform [transform:translate3d(0,0,0)]",
            "font-[family-name:var(--font-display)] font-bold uppercase leading-[0.92] tracking-[0.04em] text-mad-gold",
            "max-md:text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(4rem,10vw,12rem)]",
            "[text-shadow:0_0_22px_rgba(255,189,109,0.35)]"
          )}
        >
          PACKAGES
        </h2>

        <div className="relative z-[4] w-full md:hidden">
          <div className="mb-5 min-h-[8.25rem] px-1 sm:px-2">
            <h3 className="mt-2 max-w-[18ch] font-[family-name:var(--font-display)] text-[clamp(1.3rem,6.8vw,2rem)] font-bold uppercase leading-[1.06] tracking-[-0.03em] text-mad-highlight">
              Our packages
            </h3>
            <p className="mt-2 max-w-[34ch] text-[11px] font-medium leading-relaxed text-mad-aaa-body sm:text-xs">
              Swipe through tier cards. Tap any card to switch between coverage snapshot and
              package-delta notes.
            </p>
          </div>

          <div
            ref={mobileRailRef}
            className={cn(
              "flex gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-6 pl-1 pr-3 pt-1",
              "snap-x snap-mandatory [-webkit-overflow-scrolling:touch]",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0",
              "[touch-action:pan-x_pan-y]"
            )}
          >
            {PACKAGES.map((pkg, index) => {
              const expanded = !!mobileExpanded[pkg.id];
              const Icon = pkg.icon;
              return (
                <button
                  key={`mobile-${pkg.id}`}
                  type="button"
                  onClick={() =>
                    setMobileExpanded((prev) => ({ ...prev, [pkg.id]: !prev[pkg.id] }))
                  }
                  className={cn(
                    "snap-center shrink-0 text-left",
                    "h-[min(60dvh,30rem)] min-h-[24rem] max-h-[30rem] w-[min(92vw,24rem)]",
                    "rounded-2xl",
                    "focus-visible:ring-2 focus-visible:ring-[color:var(--mad-border-gold-ring)]",
                    "active:scale-[0.988] motion-reduce:active:scale-100",
                    "transition-transform duration-150 ease-out"
                  )}
                >
                  <div
                    className={cn(
                      "relative h-full w-full [transform-style:preserve-3d] will-change-transform",
                      "transition-[transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                      expanded && "[transform:rotateY(180deg)]"
                    )}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 flex h-full flex-col rounded-2xl border border-[color:var(--mad-border-gold-dim)] bg-[color:var(--mad-surface-panel-plum)] px-4 pb-4 pt-3.5 shadow-[var(--mad-shadow-elevated)]",
                        "[backface-visibility:hidden] [transform:rotateY(0deg)]"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <p className="pr-2 font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.19em] text-mad-aaa-gold">
                          {`${String(index + 1).padStart(2, "0")} · ${pkg.tier}`}
                        </p>
                        <span className="rounded-full border border-mad-gold/30 bg-mad-gold/5 px-2 py-1 text-[10px] text-mad-gold">
                          <Icon size={16} aria-hidden />
                        </span>
                      </div>
                      <h4 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.05rem,4.9vw,1.45rem)] font-bold uppercase leading-tight tracking-[0.08em] text-mad-highlight">
                        {pkg.name}
                      </h4>
                      <div className="mt-3 rounded-xl border border-mad-gold/20 bg-[#0f0a07]/65 p-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mad-gold/70">
                          Coverage Snapshot
                        </p>
                        <ul className="mt-2 max-h-[11.75rem] space-y-1.5 overflow-y-auto text-[11px] leading-relaxed text-mad-gold/70 sm:text-xs">
                          {pkg.features.slice(0, 3).map((feature) => (
                            <li key={feature} className="flex items-start gap-2">
                              <span className="mt-[1px] text-mad-gold/70">+</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="mt-auto pt-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-mad-aaa-body/80">
                        Tap to flip
                      </p>
                    </div>

                    <div
                      className={cn(
                        "absolute inset-0 flex h-full flex-col rounded-2xl border border-[color:var(--mad-border-gold-mid)] bg-[color:var(--mad-deep)] px-4 pb-4 pt-3.5 shadow-[var(--mad-shadow-elevated)]",
                        "[backface-visibility:hidden] [transform:rotateY(180deg)]"
                      )}
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mad-gold/70">
                        Delta Notes
                      </p>
                      <pre className="mt-3 max-h-[14.25rem] overflow-y-auto whitespace-pre-wrap rounded-xl border border-mad-gold/20 bg-[#0f0a07]/70 p-3 font-mono text-[11px] leading-relaxed text-cyan-500/60">
                        {packageTerminals[index]}
                      </pre>
                      <p className="mt-auto pt-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-mad-aaa-body/80">
                        Tap to flip back
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-end gap-2 px-1 sm:px-2">
            <button
              type="button"
              onClick={() => scrollMobileRailBy("left")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mad-gold/30 bg-mad-gold/5 text-mad-gold"
              aria-label="Scroll packages left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollMobileRailBy("right")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-mad-gold/30 bg-mad-gold/5 text-mad-gold"
              aria-label="Scroll packages right"
            >
              →
            </button>
          </div>
        </div>

        <div
          ref={stageRef}
          className="relative z-[4] hidden h-[min(82vh,760px)] w-full max-w-[1200px] [perspective:1800px] md:block"
        >
          <div
            className={cn(
              "h-full w-full",
              reducedMotion
                ? "grid grid-cols-1 gap-8 py-6 sm:grid-cols-2 sm:gap-10"
                : "relative [transform-style:preserve-3d]"
            )}
          >
            {PACKAGES.map((pkg, index) => {
              const Icon = pkg.icon;
              return (
                <article
                  key={pkg.id}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={cn(
                    "group overflow-hidden border-[0.5px] border-mad-gold/20 text-left text-[#f6e8d2] shadow-[0_24px_72px_rgba(0,0,0,0.5)] transition-[border-color,box-shadow] duration-300 hover:border-mad-gold/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)]",
                    "bg-mad-deep/40 [background-image:radial-gradient(circle_at_top,rgba(212,175,55,0.05),transparent_58%)] backdrop-blur-xl",
                    reducedMotion
                      ? "relative aspect-[10/16] min-h-[380px] rounded-2xl p-7 opacity-100"
                      : "absolute left-1/2 top-1/2 aspect-[10/16] w-[clamp(180px,24vw,340px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-4 sm:p-5 lg:p-7 opacity-0 will-change-transform"
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-45">
                    <div className="absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(255,205,143,0.08)_0_1px,transparent_1px_14px)]" />
                    <div className="absolute inset-0 [background:linear-gradient(180deg,rgba(255,219,167,0.24),transparent_38%)]" />
                  </div>

                  <div className="relative z-[1] flex h-full min-h-0 flex-col">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.2em] text-mad-gold/70">
                          {pkg.tier}
                        </p>
                        <h3 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.45rem,2.5vw,2.2rem)] uppercase leading-none tracking-[0.2em] text-mad-gold">
                          {pkg.name}
                        </h3>
                      </div>
                      <span className="rounded-full border border-mad-gold/30 bg-mad-gold/5 px-2 py-1 text-[10px] text-mad-gold">
                        <Icon size={17} aria-hidden />
                      </span>
                    </div>

                    <ul className="mt-4 max-h-[32%] space-y-1.5 overflow-y-auto text-xs leading-relaxed text-mad-gold/70 sm:text-sm">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <span className="mt-[1px] text-mad-gold/70">+</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <pre
                      ref={(el) => {
                        terminalRefs.current[index] = el;
                      }}
                      className="mt-4 min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap rounded-xl border border-mad-gold/20 bg-[#0f0a07]/70 p-3 font-mono text-[11px] leading-relaxed text-cyan-500/50"
                      aria-hidden
                    />
                  </div>

                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-mad-gold/40 to-transparent opacity-70"
                    style={{ animation: `mad-pack-scan 2.8s linear ${index * 0.34}s infinite` }}
                    aria-hidden
                  />
                </article>
              );
            })}
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes mad-pack-scan {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(420px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
