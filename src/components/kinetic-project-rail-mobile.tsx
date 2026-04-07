"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { DIGITAL_PRESENT_PROJECTS } from "@/data/digital-present-projects";
import { idleBootstrapMs } from "@/lib/mobile-perf";
import { cn } from "@/lib/utils";

const SLIDES = [...DIGITAL_PRESENT_PROJECTS];
/** `slide.width` ile uyumlu — küçük ekranda ~520px kaynak. */
const MOBILE_IMG_SIZES =
  "(max-width: 768px) min(40vw, 320px), (max-width: 1024px) min(88vw, 520px), 90vw";

const CARD_SHELL_H =
  "h-[min(52dvh,26rem)] min-h-[22rem] max-h-[26rem] w-[min(88vw,22rem)]";

function KineticFlipCard({
  slide,
  flipped,
  onToggle,
}: {
  slide: (typeof SLIDES)[number];
  flipped: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="snap-center shrink-0 pl-1 first:pl-0" style={{ perspective: "1000px" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={flipped}
        aria-label={
          flipped
            ? `Show project front — ${slide.clientCode}`
            : `Show AI-first details — ${slide.clientCode}`
        }
        className={cn(
          "mad-kinetic-card-btn relative block text-left outline-none",
          CARD_SHELL_H,
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
            flipped && "[transform:rotateY(180deg)]"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className={cn(
              "absolute inset-0 overflow-hidden rounded-2xl border border-[color:var(--mad-border-gold-dim)]",
              "bg-[color:var(--mad-surface-panel-plum)] shadow-[var(--mad-shadow-elevated)]",
              "[backface-visibility:hidden] [transform:rotateY(0deg)]"
            )}
          >
            <div className="relative h-[68%] w-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                width={slide.width}
                height={slide.height}
                sizes={MOBILE_IMG_SIZES}
                quality={72}
                className="h-full w-full object-cover object-center"
                draggable={false}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--mad-surface-panel-plum)]/90 via-transparent to-transparent" />
            </div>
            <div className="flex h-[32%] flex-col justify-end gap-1 px-4 pb-3 pt-1">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-mad-aaa-gold">
                <span>{slide.id}</span>
                <span className="text-mad-aaa-body"> · </span>
                <span className="text-mad-highlight">{slide.clientCode}</span>
              </p>
              <p className="font-[family-name:var(--font-display)] text-xs font-bold uppercase leading-tight tracking-wide text-mad-aaa-primary">
                {slide.title}
              </p>
            </div>
            <p className="pointer-events-none absolute bottom-2 right-3 text-[9px] font-semibold uppercase tracking-wider text-mad-aaa-body/80">
              Tap to flip
            </p>
          </div>

          <div
            className={cn(
              "absolute inset-0 flex flex-col rounded-2xl border border-[color:var(--mad-border-gold-mid)]",
              "bg-[color:var(--mad-deep)] px-4 py-4 shadow-[var(--mad-shadow-elevated)]",
              "[backface-visibility:hidden] [transform:rotateY(180deg)]"
            )}
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-mad-aaa-gold">
              AI-first
            </p>
            <p className="mt-3 font-sans text-sm font-semibold leading-relaxed text-mad-aaa-primary">
              {slide.description}
            </p>
            {slide.technicalBadge ? (
              <div className="mt-auto pt-4">
                <span className="inline-flex min-h-10 items-center rounded-full border border-[color:var(--mad-border-gold-strong)] bg-mad-deep/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-mad-aaa-gold backdrop-blur-md">
                  {slide.technicalBadge}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </button>
    </div>
  );
}

/** Mobil: yatay şerit. GSAP Observer chunk — touch veya idle ile yüklenir (ilk boyama korunur). */
export function KineticProjectRailMobile({ className }: { className?: string }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  const toggle = useCallback((id: string) => {
    setFlipped((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;

    let cancelled = false;
    let observerKill: (() => void) | null = null;
    const armGate = { started: false };

    const arm = () => {
      if (observerKill || cancelled || armGate.started) return;
      armGate.started = true;
      void Promise.all([import("gsap"), import("gsap/dist/Observer")]).then(
        ([{ default: gsap }, { Observer }]) => {
          if (cancelled || !el.isConnected || observerKill) return;
          gsap.registerPlugin(Observer);
          const obs = Observer.create({
            target: el,
            type: "wheel",
            wheelSpeed: -1,
            onChangeY: (self) => {
              el.scrollLeft += self.deltaY;
            },
          });
          observerKill = () => obs.kill();
        }
      );
    };

    const idleMs = idleBootstrapMs();
    const t = window.setTimeout(arm, idleMs);
    const onTouch = () => {
      window.clearTimeout(t);
      arm();
    };
    el.addEventListener("touchstart", onTouch, { passive: true });
    el.addEventListener("wheel", onTouch, { passive: true });

    const onMq = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        observerKill?.();
        observerKill = null;
        armGate.started = false;
      }
    };
    mq.addEventListener("change", onMq);

    return () => {
      cancelled = true;
      armGate.started = false;
      window.clearTimeout(t);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("wheel", onTouch);
      mq.removeEventListener("change", onMq);
      observerKill?.();
    };
  }, []);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-5 min-h-[11.5rem] px-4 sm:min-h-[10rem]">
        <p className="font-serif text-[10px] font-semibold not-italic tracking-[0.28em] text-mad-aaa-gold">
          Project rail
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.25rem)] font-bold uppercase leading-[1.08] tracking-[-0.03em] text-mad-highlight">
          Selected client work
        </h2>
        <p className="mt-2 max-w-prose text-xs font-medium leading-relaxed text-mad-aaa-body">
          Swipe horizontally. Tap a card to flip — front shows the line of business; back reveals the
          AI-native build story.
        </p>
      </div>

      <div
        ref={railRef}
        className={cn(
          "flex min-h-[min(58dvh,30rem)] gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-6 pl-4 pr-6 pt-1",
          "snap-x snap-mandatory [-webkit-overflow-scrolling:touch]",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0",
          "[touch-action:pan-x]"
        )}
      >
        {SLIDES.map((slide) => (
          <KineticFlipCard
            key={slide.id}
            slide={slide}
            flipped={!!flipped[slide.id]}
            onToggle={() => toggle(slide.id)}
          />
        ))}
      </div>
    </div>
  );
}
