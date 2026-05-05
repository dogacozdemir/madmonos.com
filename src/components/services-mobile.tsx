"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { MORPHING_SERVICES } from "@/data/mad-genius-copy";

/** Same geometry as `spotlight-team-mobile` carousel stepping */
const CAROUSEL_GAP_PX = 16;

const LAST_SERVICE_PADDING =
  "pb-[max(5.5rem,calc(4.25rem+env(safe-area-inset-bottom,0px)))]";

/**
 * Mobile services — team-style horizontal rail: floating avatar centerpiece,
 * no nested card chrome; GSAP slide+scale on focus; copy block with gold divider.
 */
export function ServicesMobile() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef(0);
  const cardInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const detailInit = useRef(true);
  const prevIdx = useRef(0);
  const cardAnimPrimed = useRef(false);

  const assignCardInnerRef = (i: number) => (el: HTMLDivElement | null) => {
    cardInnerRefs.current[i] = el;
  };

  const assignDetailRef = (i: number) => (el: HTMLDivElement | null) => {
    detailRefs.current[i] = el;
  };

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
      const idx = Math.round(track.scrollLeft / step);
      setActiveIdx(Math.min(MORPHING_SERVICES.length - 1, Math.max(0, idx)));
    });
  };

  useEffect(() => {
    return () => cancelAnimationFrame(scrollRafRef.current);
  }, []);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!cardAnimPrimed.current) {
      cardAnimPrimed.current = true;
      cardInnerRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          scale: i === activeIdx ? 1 : 0.86,
          opacity: i === activeIdx ? 1 : 0.38,
          x: 0,
          force3D: true,
        });
      });
      return;
    }

    const from = prevIdx.current;
    const dir = activeIdx > from ? 1 : activeIdx < from ? -1 : 0;
    prevIdx.current = activeIdx;

    cardInnerRefs.current.forEach((el, i) => {
      if (!el) return;
      if (reduced) {
        gsap.set(el, { scale: i === activeIdx ? 1 : 0.92, opacity: i === activeIdx ? 1 : 0.45, x: 0 });
        return;
      }
      if (i === activeIdx) {
        const fromX = dir === 0 ? 0 : dir * 40;
        gsap.fromTo(
          el,
          { scale: 0.88, opacity: 0.55, x: fromX },
          {
            scale: 1,
            opacity: 1,
            x: 0,
            duration: 0.52,
            ease: "power3.out",
            overwrite: true,
            force3D: true,
          }
        );
      } else {
        gsap.to(el, {
          scale: 0.86,
          opacity: 0.38,
          x: 0,
          duration: 0.36,
          ease: "power2.out",
          overwrite: true,
          force3D: true,
        });
      }
    });
  }, [activeIdx]);

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    detailRefs.current.forEach((el, i) => {
      if (!el) return;
      if (detailInit.current) {
        gsap.set(el, { opacity: i === activeIdx ? 1 : 0, y: 0 });
        return;
      }
      if (reduced) {
        gsap.set(el, { opacity: i === activeIdx ? 1 : 0, y: 0 });
        return;
      }
      if (i === activeIdx) {
        gsap.fromTo(
          el,
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.48, ease: "power2.out", overwrite: true, force3D: true }
        );
      } else {
        gsap.to(el, {
          opacity: 0,
          y: 12,
          duration: 0.24,
          ease: "power2.in",
          overwrite: true,
          force3D: true,
        });
      }
    });
    detailInit.current = false;
  }, [activeIdx]);

  return (
    <section
      id="services"
      className="relative z-[25] overflow-hidden border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base"
      aria-label="Services"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="mad-hero-scan-hum-layer absolute inset-0" />
      </div>

      <div className="relative z-[1]">
        <div className="px-6 pb-4 pt-12">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-mad-aaa-body">
            Services
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.5rem)] font-bold uppercase leading-[1.06] tracking-[-0.03em] text-mad-highlight">
            What we offer
          </h2>
        </div>

        <div
          ref={trackRef}
          onScroll={onScroll}
          role="region"
          aria-label="Service lineup"
          aria-live="polite"
          aria-atomic="false"
          className={cn(
            "mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto",
            "px-6 pb-2",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          )}
        >
          {MORPHING_SERVICES.map((service, i) => (
            <article
              key={service.id}
              aria-label={service.title}
              className={cn(
                "relative shrink-0 snap-start",
                "w-[76vw] max-w-[304px]"
              )}
            >
              <div
                ref={assignCardInnerRef(i)}
                className="flex flex-col items-center [transform:translate3d(0,0,0)] will-change-transform"
              >
                <div
                  className={cn(
                    "relative aspect-[3/4] w-full max-h-[min(68vh,400px)]",
                    "animate-mad-float motion-reduce:animate-none"
                  )}
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    fill
                    sizes="76vw"
                    className="object-contain object-center drop-shadow-[0_16px_48px_rgba(201,174,85,0.18)]"
                    draggable={false}
                    priority={i === 0}
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-mad-base via-mad-base/40 to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </article>
          ))}
        </div>

        <div
          className="mt-5 flex justify-center gap-2 px-6"
          role="group"
          aria-label="Navigate services"
        >
          {MORPHING_SERVICES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Go to ${s.title}`}
              aria-current={i === activeIdx ? "true" : undefined}
              onClick={() => scrollTo(i)}
              className={cn(
                "mad-carousel-dot-hit cursor-pointer",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--mad-gold)]"
              )}
            >
              <span
                className={cn(
                  "mad-carousel-dot-hit__pill",
                  i === activeIdx
                    ? "w-6 bg-[color:var(--mad-gold)]"
                    : "w-1.5 bg-mad-highlight/25 hover:bg-mad-highlight/50"
                )}
                aria-hidden
              />
            </button>
          ))}
        </div>

        <div className={cn("relative z-[2] mx-6 mt-8", LAST_SERVICE_PADDING)}>
          <div
            className="h-px w-full bg-gradient-to-r from-transparent via-[color:var(--mad-gold)] to-transparent opacity-70"
            aria-hidden
          />

          <div className="relative mt-6 min-h-[7.5rem]">
            {MORPHING_SERVICES.map((service, i) => (
              <div
                key={service.id}
                ref={assignDetailRef(i)}
                aria-hidden={i !== activeIdx}
                className={cn(
                  i === activeIdx
                    ? "relative"
                    : "pointer-events-none absolute inset-x-0 top-0 opacity-0"
                )}
              >
                <h3 className="text-center font-[family-name:var(--font-display)] text-xl font-bold uppercase leading-tight tracking-[-0.02em] text-mad-highlight">
                  {service.title}
                </h3>
                {service.technicalBadge ? (
                  <p className="mt-2 text-center font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--mad-gold)]">
                    {service.technicalBadge}
                  </p>
                ) : null}
                <p className="mt-4 text-center text-sm leading-relaxed text-mad-aaa-body [text-wrap:pretty]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
