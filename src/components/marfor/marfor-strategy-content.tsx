"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { navClearancePaddingClass, navClearanceScrollMarginClass } from "@/lib/nav-clearance";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";

type ForceDef = {
  id: string;
  eyebrow: string;
  title: string;
  focus: string;
  body: string;
  bullets: readonly string[];
  Icon: () => ReactElement;
};

function IconStrategic() {
  return (
    <svg viewBox="0 0 120 120" className="h-[52%] w-[52%] text-mad-aaa-gold" fill="none" aria-hidden>
      <path
        d="M24 88V52l20 12 24-32 20 16 12-20v44H24Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
        className="opacity-95"
      />
      <path d="M24 72h72" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <circle cx="44" cy="56" r="4" fill="currentColor" opacity="0.9" />
      <circle cx="68" cy="44" r="4" fill="currentColor" opacity="0.75" />
      <circle cx="88" cy="60" r="4" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function IconCreative() {
  return (
    <svg viewBox="0 0 120 120" className="h-[52%] w-[52%] text-mad-aaa-gold" fill="none" aria-hidden>
      <circle cx="60" cy="52" r="22" stroke="currentColor" strokeWidth="2" className="opacity-90" />
      <path
        d="M60 30v-8M60 82v8M38 52h-8M90 52h8M43 35l-6-6M83 85l-6-6M43 69l-6 6M83 35l-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M52 48c4-6 12-6 16 0s12 4 16-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="52" cy="54" r="3" fill="currentColor" />
      <circle cx="68" cy="54" r="3" fill="currentColor" />
    </svg>
  );
}

function IconOperational() {
  return (
    <svg viewBox="0 0 120 120" className="h-[52%] w-[52%] text-mad-aaa-gold" fill="none" aria-hidden>
      <rect x="22" y="28" width="34" height="28" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.9" />
      <rect x="64" y="28" width="34" height="28" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.65" />
      <rect x="22" y="64" width="34" height="28" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.55" />
      <rect x="64" y="64" width="34" height="28" rx="6" stroke="currentColor" strokeWidth="2" opacity="0.8" />
      <path d="M39 42h6M87 50h6M39 78h6M78 82h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function IconTechnical() {
  return (
    <svg viewBox="0 0 120 120" className="h-[52%] w-[52%] text-mad-aaa-gold" fill="none" aria-hidden>
      <circle cx="36" cy="40" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="84" cy="40" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="60" cy="82" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M44 46 L76 46 M42 50 L58 74 M78 50 L62 74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <path
        d="M60 28v8M28 60h8M92 60h-8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

const FORCES: readonly ForceDef[] = [
  {
    id: "strategic-force",
    eyebrow: "Performance pillar",
    title: "The Strategic Force",
    focus: "Cross-platform media buying, retargeting, and conversion science.",
    body:
      "Every decision is backed by hard data. We scale Meta, Google, and TikTok with obsessive attention to ROI, advanced retargeting ecosystems, and cross-platform spend optimization — the high-performance arm of a frictionless, end-to-end operational solution.",
    bullets: [
      "Meta, Google & TikTok execution with unified measurement",
      "Advanced retargeting and high-intent audience capture",
      "Spend and creative performance tuned for conversion, not vanity",
    ],
    Icon: IconStrategic,
  },
  {
    id: "creative-force",
    eyebrow: "Creative pillar",
    title: "The Creative Force",
    focus: "AI-enhanced creative, video, and consistent brand avatars.",
    body:
      "Dynamic assets win attention. We pair human craft with generative scale: social and ad creatives, product visuals, email and HTML5 units — plus dedicated AI avatars that act as emotion-driven virtual employees for your campaigns, without traditional on-camera logistics.",
    bullets: [
      "High-volume static & video for social and paid",
      "Brand identity, product imagery, and HTML5 experiences",
      "AI avatars as repeatable, on-brand “faces” for content",
    ],
    Icon: IconCreative,
  },
  {
    id: "operational-force",
    eyebrow: "Operations pillar",
    title: "The Operational Force",
    focus: "Dashboards, real-time flows, and day-to-day execution off your plate.",
    body:
      "We respect your time. Campaign and social operations run without bottlenecks: custom web and mobile dashboards replace stale PDFs, automations strip manual busywork, and you see campaign, operational, and ROI signals when you need them — truly frictionless delivery.",
    bullets: [
      "End-to-end campaign & social management",
      "Real-time reporting instead of outdated static reports",
      "Radical transparency through engineered data flows",
    ],
    Icon: IconOperational,
  },
  {
    id: "technical-force",
    eyebrow: "Technical pillar",
    title: "The Technical Force",
    focus: "SEO-GEO, apps, and CRM / CDP / ERP integrations.",
    body:
      "Immense engineering capacity underpins MarFor. We secure organic visibility with elite SEO and GEO (Generative Engine Optimization), build robust web and mobile surfaces, and integrate CRM, CDP, and ERP into one stack — automating standard marketing tasks so your team focuses on the business.",
    bullets: [
      "SEO & GEO engineered for AI-era discovery",
      "Web & mobile apps tailored to your workflows",
      "Deep integrations and workflow automation",
    ],
    Icon: IconTechnical,
  },
];

function ForceSection({ force, reverse }: { force: ForceDef; reverse: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const spin = spinRef.current;
    if (!root || !spin) return;

    let disposed = false;
    let ctx: { revert: () => void } | undefined;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (disposed) return;
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(spin, { rotateY: -14, rotateX: 7, rotateZ: -2, force3D: true, transformOrigin: "50% 50%" });
        return;
      }

      ctx = gsap.context(() => {
        gsap.fromTo(
          spin,
          { rotateY: -38, rotateX: 14, rotateZ: -5, force3D: true, transformOrigin: "50% 50%" },
          {
            rotateY: 32,
            rotateX: -10,
            rotateZ: 6,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 82%",
              end: "bottom 18%",
              scrub: 0.9,
              invalidateOnRefresh: true,
            },
          }
        );
      }, root);

      requestAnimationFrame(() => scheduleScrollTriggerRefresh());
    });

    return () => {
      disposed = true;
      ctx?.revert();
    };
  }, []);

  const Icon = force.Icon;

  return (
    <section
      ref={rootRef}
      id={force.id}
      className={cn(
        navClearanceScrollMarginClass,
        "w-full border-t border-[color:var(--mad-border-highlight-faint)] pb-14 pt-14 last:pb-0 md:pb-[clamp(3.25rem,7vw,5rem)] md:pt-[clamp(3.5rem,8vw,5.5rem)] md:last:pb-0",
        "first:border-t-0 first:pt-0"
      )}
      aria-labelledby={`${force.id}-heading`}
    >
      <div
        className={cn(
          "grid items-start gap-10 md:grid-flow-dense md:gap-x-12 md:gap-y-10 lg:gap-x-16 lg:gap-y-12",
          reverse ? "md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]" : "md:grid-cols-[minmax(0,0.92fr)_minmax(0,1fr)]"
        )}
      >
        <div className={cn("min-w-0 space-y-3 md:space-y-4", reverse && "md:order-2")}>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mad-aaa-gold sm:text-[11px]">
            {force.eyebrow}
          </p>
          <h2
            id={`${force.id}-heading`}
            className={cn(
              "font-[family-name:var(--font-montserrat)] text-[clamp(1.65rem,4.2vw,2.75rem)] font-light font-synthesis-none tracking-tight text-mad-aaa-primary antialiased",
              "leading-[1.12] md:leading-[1.08]"
            )}
          >
            {force.title}
          </h2>
          <p className="text-sm font-semibold leading-snug text-mad-aaa-body/95 sm:text-base">{force.focus}</p>
          <p className="text-base font-medium leading-relaxed text-mad-aaa-body sm:text-[1.05rem]">{force.body}</p>
          <ul className="space-y-3 border-l-2 border-[color:var(--mad-border-gold-soft)] pl-5 pt-1">
            {force.bullets.map((b) => (
              <li key={b} className="text-sm leading-relaxed text-mad-aaa-body sm:text-[0.9375rem]">
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div
          className={cn(
            "mx-auto w-full max-w-[min(100%,22rem)] shrink-0 md:mx-0 md:max-w-none md:justify-self-end",
            reverse ? "md:order-1 md:justify-self-start" : undefined
          )}
        >
          <div
            className="relative mx-auto aspect-square w-full max-w-[20rem] sm:max-w-[22rem] lg:max-w-[24rem]"
            style={{ perspective: "1100px" }}
          >
            <div
              ref={spinRef}
              className={cn(
                "relative h-full w-full [transform-style:preserve-3d] will-change-transform",
                "rounded-[2rem] border border-[color:var(--mad-border-gold-soft)] bg-gradient-to-br",
                "from-[#120a18]/95 via-mad-deep/90 to-mad-base/95",
                "shadow-[0_28px_80px_-24px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(201,174,85,0.14)]",
                "ring-1 ring-white/[0.06]"
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -inset-px rounded-[2rem] opacity-70"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(201,174,85,0.22) 0%, transparent 42%, transparent 58%, rgba(248,250,252,0.06) 100%)",
                }}
                aria-hidden
              />
              <div className="flex h-full w-full items-center justify-center [transform:translateZ(12px)]">
                <Icon />
              </div>
              <div
                className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-center font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-mad-aaa-body/80 backdrop-blur-sm sm:text-[10px]"
                aria-hidden
              >
                MarFor · engineered
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MarForStrategyContent() {
  return (
    <main
      className={cn(
        "relative w-full bg-mad-base",
        navClearancePaddingClass,
        "flex flex-col",
        "px-[max(1rem,env(safe-area-inset-left))] pb-28",
        "pr-[max(1rem,env(safe-area-inset-right))] md:px-12 lg:px-16"
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-0">
        <h1 className="sr-only">MarFor — The MarFor Strategy: Engineering Your Growth</h1>

        <div className="flex w-full flex-col">
          {FORCES.map((force, i) => (
            <ForceSection key={force.id} force={force} reverse={i % 2 === 1} />
          ))}
        </div>

        <footer className="mt-16 w-full border-t border-[color:var(--mad-border-highlight-faint)] pt-10 md:mt-20">
          <p className="max-w-2xl text-sm leading-relaxed text-mad-aaa-body">
            Ready to engineer the full lifecycle — creative, media, ops, and stack — in one motion? Start on the home
            experience or open Discovery from the nav.
          </p>
          <div className="mt-6 flex flex-wrap gap-6">
            <Link
              href="/#hero"
              className="text-sm font-semibold uppercase tracking-wider text-mad-aaa-gold transition-colors hover:text-mad-gold"
            >
              ← Home
            </Link>
            <Link
              href="/#projects"
              className="text-sm font-semibold uppercase tracking-wider text-mad-aaa-body transition-colors hover:text-mad-aaa-primary"
            >
              View projects
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
