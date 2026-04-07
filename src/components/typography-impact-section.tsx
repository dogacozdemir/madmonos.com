"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const SQL_TERMINAL_SAMPLE =
  "madmonos_vault=# SELECT COUNT(*) AS n FROM vault.projects WHERE status IN ('live','staging') AND id <= 300;\n" +
  "-- EXPLAIN: Bitmap Heap Scan on idx_vault_tier_status ...";

const TECH_SNIPPETS = [
  "GRAPH :: creative ──► stack",
  "export const revalidate = 3600",
  "SELECT status, COUNT(*) FROM vault.projects GROUP BY 1",
  "[NODES] 12 · [EDGES] 19",
] as const;

/**
 * Impact / X-Ray — koyu editorial sahne: köşe başlıklar, ortada gorilla, tarama çizgisi, minimal veri kartları.
 */
export function TypographyImpactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const scanWrapRef = useRef<HTMLDivElement>(null);
  const xrayStackRef = useRef<HTMLDivElement>(null);
  const brightClipRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);
  const beautifulRef = useRef<HTMLHeadingElement>(null);
  const brilliantRef = useRef<HTMLHeadingElement>(null);
  const gorillaPulseRef = useRef<HTMLDivElement>(null);
  const techBandRef = useRef<HTMLDivElement>(null);
  const sqlCountRef = useRef<HTMLParagraphElement>(null);
  const pipelineCountRef = useRef<HTMLParagraphElement>(null);
  const sqlTerminalRef = useRef<HTMLPreElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scanWrap = scanWrapRef.current;
    const xray = xrayStackRef.current;
    const brightClip = brightClipRef.current;
    const tech = techRef.current;
    const techBand = techBandRef.current;
    const beautiful = beautifulRef.current;
    const brilliant = brilliantRef.current;
    const gorillaWrap = gorillaPulseRef.current;
    const sqlEl = sqlCountRef.current;
    const pipelineEl = pipelineCountRef.current;
    const terminalPre = sqlTerminalRef.current;
    if (
      !section ||
      !scanWrap ||
      !xray ||
      !brightClip ||
      !tech ||
      !techBand ||
      !beautiful ||
      !brilliant ||
      !gorillaWrap ||
      !sqlEl ||
      !pipelineEl
    ) {
      return;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pulseTween: gsap.core.Tween | null = null;
    let pointerBias = 0;
    let lastProgress = 0;
    let prevScanT = 0;
    /** Glitch tweens scroll sırasında birikmesin diye zaman sınırı */
    let lastGlitchAt = 0;
    let lastScrollTForVel = 0;
    let lastScrollTime = performance.now();
    const bandHalfPct = 2.75;

    const setFrame = (p: number, source: "scroll" | "pointer" = "scroll") => {
      lastProgress = p;
      const scrollT = gsap.utils.clamp(0, 1, p);

      const nowVel = performance.now();
      const dtVel = (nowVel - lastScrollTime) / 1000;
      const scrollVelocity = dtVel > 0.0008 ? Math.abs(scrollT - lastScrollTForVel) / dtVel : 0;
      lastScrollTForVel = scrollT;
      lastScrollTime = nowVel;
      const fastScroll = source === "scroll" && scrollVelocity > 1.35;

      const t = gsap.utils.clamp(0, 1, scrollT + pointerBias);
      const prevT = prevScanT;
      prevScanT = t;
      const dt = Math.abs(t - prevT);

      const yPct = t * 100;
      scanWrap.style.top = `${yPct}%`;
      brightClip.style.clipPath = `inset(0 0 ${(1 - t) * 100}% 0)`;

      const y1 = Math.max(0, yPct - bandHalfPct);
      const y2 = Math.min(100, yPct + bandHalfPct);
      techBand.style.clipPath = `inset(${y1}% 0 ${100 - y2}% 0)`;

      const techOp = 0.06 + scrollT * 0.28;
      tech.style.opacity = String(techOp);
      beautiful.style.transform = `translate3d(${-100 * scrollT}px,0,0)`;
      brilliant.style.transform = `translate3d(${100 * scrollT}px,0,0)`;

      const sqlN = Math.round(300 * scrollT);
      const pipeN = Math.round(40 * scrollT);
      const sqlTxt = `${sqlN}+`;
      const pipeTxt = `${pipeN}%`;
      if (sqlEl.textContent !== sqlTxt) sqlEl.textContent = sqlTxt;
      if (pipelineEl.textContent !== pipeTxt) pipelineEl.textContent = pipeTxt;

      if (terminalPre) {
        const tn = Math.max(
          0,
          Math.floor(SQL_TERMINAL_SAMPLE.length * Math.min(1, scrollT * 1.08 + 0.02))
        );
        const blink =
          scrollT > 0.02 && scrollT < 0.99
            ? Math.floor(performance.now() / 400) % 2 === 0
              ? "▍"
              : " "
            : "";
        const nextFull = SQL_TERMINAL_SAMPLE.slice(0, tn) + (scrollT >= 0.99 ? "" : blink);
        if (terminalPre.textContent !== nextFull) {
          terminalPre.textContent = nextFull;
        }
      }

      const now = performance.now();
      const scrollDriven = source === "scroll";
      if (!reduced && scrollDriven && dt > 0.032 && now - lastGlitchAt > 220) {
        lastGlitchAt = now;
        const skewRaw = (Math.random() - 0.5) * (fastScroll ? 5 : 7);
        const skewX = gsap.utils.clamp(-3, 3, skewRaw);
        const xJitter = fastScroll
          ? (Math.random() - 0.5) * 4
          : (Math.random() - 0.5) * 8;
        gsap.fromTo(
          techBand,
          { x: xJitter, skewX },
          {
            x: 0,
            skewX: 0,
            duration: 0.06,
            ease: "steps(2)",
            overwrite: "auto",
            force3D: true,
          }
        );
      }
    };

    const nudge = () => setFrame(lastProgress, "pointer");

    const onPointerMove = (e: PointerEvent) => {
      const r = xray.getBoundingClientRect();
      const ny = (e.clientY - r.top) / Math.max(1, r.height);
      pointerBias = (ny - 0.5) * 0.11;
      nudge();
    };
    const onPointerLeave = () => {
      pointerBias = 0;
      nudge();
    };

    if (!reduced) {
      xray.addEventListener("pointermove", onPointerMove);
      xray.addEventListener("pointerleave", onPointerLeave);
    }

    const ctx = gsap.context(() => {
      if (reduced) {
        setFrame(0.55);
        return;
      }

      pulseTween = gsap.to(gorillaWrap, {
        scale: 1.05,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        transformOrigin: "50% 55%",
        force3D: true,
      });

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        /* Lenis ile çift yumuşatma (scrub:1) takılma hissine yol açıyor; doğrudan eşleme daha akıcı. */
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => setFrame(self.progress, "scroll"),
        onRefresh: (self) => setFrame(self.progress, "scroll"),
      });
      setFrame(st.progress);
    }, section);

    return () => {
      if (!reduced) {
        xray.removeEventListener("pointermove", onPointerMove);
        xray.removeEventListener("pointerleave", onPointerLeave);
      }
      pulseTween?.kill();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="impact"
      className="relative min-h-[220vh] border-y border-[color:var(--mad-border-subtle)] bg-mad-deep text-mad-highlight [transform:translate3d(0,0,0)]"
      aria-label="Impact — Beautiful surfaces, brilliant systems"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex min-h-screen w-full items-center justify-center overflow-hidden pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-[max(1.5rem,env(safe-area-inset-left))] sm:pr-[max(1.5rem,env(safe-area-inset-right))] md:px-10 lg:px-12"
      >
        <h2
          ref={beautifulRef}
          className={cn(
            "beautiful pointer-events-none absolute left-0 top-0 z-[2] max-w-[min(92vw,14ch)] p-6 sm:p-8 md:max-w-[55%] md:p-10 lg:p-12",
            "will-change-transform [transform:translate3d(0,0,0)]",
            "font-[family-name:var(--font-display)] font-light uppercase leading-[0.92] tracking-[0.06em]",
            "max-md:text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(4rem,10vw,12rem)]",
            "[-webkit-text-stroke:1px_var(--mad-text-stroke-beautiful)] [-webkit-text-fill-color:transparent]",
            "[text-shadow:var(--mad-text-shadow-beautiful-glow)]"
          )}
        >
          Beautiful
          <span className="hidden sm:inline"> </span>
          <br className="sm:hidden" />
          surfaces
        </h2>

        <h2
          ref={brilliantRef}
          className={cn(
            "brilliant pointer-events-none absolute bottom-0 right-0 z-[2] max-w-[min(92vw,14ch)] p-6 text-right sm:p-8 md:max-w-[55%] md:p-10 lg:p-12",
            "will-change-transform [transform:translate3d(0,0,0)]",
            "font-[family-name:var(--font-display)] font-bold uppercase leading-[0.92] tracking-[0.04em] text-mad-gold",
            "max-md:text-[clamp(1.5rem,8vw,2.5rem)] md:text-[clamp(4rem,10vw,12rem)]",
            "[text-shadow:var(--mad-text-shadow-systems-primary)] [filter:var(--mad-filter-drop-systems)]"
          )}
        >
          Brilliant
          <span className="hidden sm:inline"> </span>
          <br className="sm:hidden" />
          systems
        </h2>

        {/* Metadata — minimal bento, köşelerde ana tipografiden uzak */}
        <div
          className={cn(
            "pointer-events-none absolute bottom-6 left-4 z-[4] max-w-[13rem] rounded-md border border-[color:var(--mad-border-subtle)] bg-transparent px-3 py-2.5 sm:bottom-10 sm:left-6 md:bottom-12 md:left-10 md:max-w-[14rem] md:px-4 md:py-3"
          )}
        >
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-mad-aaa-body sm:text-[9px]">
            madmonos_vault · SQL
          </p>
          <pre
            ref={sqlTerminalRef}
            className="mt-2 max-h-[5rem] overflow-hidden whitespace-pre-wrap font-mono text-[7px] leading-relaxed text-mad-aaa-gold sm:max-h-[5.5rem] sm:text-[8px]"
            aria-hidden
          />
          <p
            ref={sqlCountRef}
            className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-mad-aaa-gold sm:text-3xl md:text-4xl [text-shadow:var(--mad-impact-sql-glow)]"
          >
            0+
          </p>
        </div>

        <div
          className={cn(
            "pointer-events-none absolute bottom-6 right-4 z-[4] max-w-[11rem] rounded-md border border-[color:var(--mad-border-subtle)] bg-transparent px-3 py-2.5 text-right sm:bottom-10 sm:right-6 md:bottom-12 md:right-10 md:max-w-[12rem] md:px-4 md:py-3"
          )}
        >
          <p className="font-mono text-[8px] font-medium uppercase tracking-[0.2em] text-mad-aaa-body sm:text-[9px]">
            Pipeline lift
          </p>
          <p
            ref={pipelineCountRef}
            className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold tabular-nums text-mad-aaa-gold sm:text-3xl md:text-4xl [text-shadow:var(--mad-impact-pipeline-glow)]"
          >
            0%
          </p>
        </div>

        {/* Orta: X-ray yığını — 60vh gorilla (pointer: scan bias) */}
        <div className="relative z-[3] flex w-full max-w-[min(92vw,560px)] flex-col items-center justify-center py-[clamp(7.5rem,18vh,11rem)] md:max-w-[min(85vw,640px)]">
          <div
            ref={xrayStackRef}
            className="relative h-[min(60vh,520px)] w-full max-w-[420px] touch-none sm:max-w-[min(72vw,480px)] md:h-[60vh] md:max-w-none md:touch-auto"
          >
            <div
              ref={techRef}
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-lg border border-[color:var(--mad-border-gold-soft)] bg-[color:var(--mad-surface-panel-plum)] font-mono text-[8px] leading-relaxed text-[color:var(--mad-impact-terminal-muted)] sm:text-[9px] md:rounded-xl md:text-[10px]"
              aria-hidden
            >
              <div className="mad-impact-tech-grid-24 pointer-events-none absolute inset-0 opacity-40" aria-hidden />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <pre className="whitespace-pre-wrap text-mad-highlight">
                  {`// topology · hydrated
{ "creative": "AI_RENDER",
  "stack": "NEXT_PIPELINE",
  "edges": 19 }`}
                </pre>
                <div className="space-y-1 text-[color:var(--mad-impact-terminal-muted)]">
                  {TECH_SNIPPETS.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>
            </div>

            <div
              ref={gorillaPulseRef}
              className="absolute inset-0 z-[1] flex items-center justify-center will-change-transform"
            >
              <div className="relative h-full w-full">
                <Image
                  src="/beautiful-surfaces.webp"
                  alt=""
                  fill
                  className="object-contain object-center opacity-20 drop-shadow-[var(--mad-drop-impact-back)]"
                  sizes="(max-width: 768px) min(40vw, 360px), (max-width: 1200px) 45vw, min(560px, 38vw)"
                  priority={false}
                />

                <div
                  ref={techBandRef}
                  className="pointer-events-none absolute inset-0 z-[1] overflow-hidden will-change-[clip-path]"
                  style={{ clipPath: "inset(100% 0 0 0)" }}
                  aria-hidden
                >
                  <div className="relative h-full w-full">
                    <Image
                      src="/beautiful-surfaces.webp"
                      alt=""
                      fill
                      className="object-contain object-center [filter:var(--mad-filter-xray-cyan)]"
                      sizes="(max-width: 768px) min(40vw, 360px), (max-width: 1200px) 45vw, min(560px, 38vw)"
                      priority={false}
                    />
                    <div className="mad-impact-scan-overlay absolute inset-0 mix-blend-overlay" />
                    <div className="mad-impact-dual-wash-bg absolute inset-0 mix-blend-soft-light" />
                    <div className="mad-impact-fine-grid-10 absolute inset-0 opacity-[0.38]" />
                  </div>
                </div>

                <div
                  ref={brightClipRef}
                  className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden"
                  style={{ clipPath: "inset(0 0 100% 0)" }}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src="/beautiful-surfaces.webp"
                      alt="Futuristic module with gold and purple circuitry, gorilla icon, and AI MarTech system labels"
                      fill
                      className="object-contain object-center drop-shadow-[var(--mad-drop-impact-front)]"
                      sizes="(max-width: 768px) min(40vw, 360px), (max-width: 1200px) 45vw, min(560px, 38vw)"
                      priority={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={scanWrapRef}
              className="pointer-events-none absolute left-[-4%] right-[-4%] z-[5] h-0 will-change-[top]"
              style={{ top: "0%" }}
            >
              <div
                className="mad-scan-hum pointer-events-none absolute left-0 right-0 top-0 h-px bg-mad-gold"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
