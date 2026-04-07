"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const LABELS = [
  "Web development",
  "AI creative",
  "Automation",
  "Strategy",
  "MarTech",
] as const;

/** Central madmonos mark + orbiting “petals”; scroll drives rotation; labels drift on independent loops. */
export function ServiceFlowerSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const driftRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    let ctx: gsap.Context | undefined;
    const raf = requestAnimationFrame(() => {
      const section = sectionRef.current;
      const flower = flowerRef.current;
      if (!section || !flower) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        if (!reduced) {
          gsap.fromTo(
            section,
            { clipPath: "inset(12% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "top 58%",
                scrub: 0.7,
              },
            }
          );

          gsap.to(flower, {
            rotate: 28,
            scale: 1.08,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        }

        driftRefs.current.forEach((el, i) => {
          if (!el || reduced) return;
          gsap.to(el, {
            x: i % 2 === 0 ? 14 : -12,
            y: (i % 3) * 6 - 6,
            duration: 3.2 + i * 0.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            force3D: true,
          });
        });
      }, section);
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services-legacy"
      className="relative overflow-hidden bg-mad-base py-24 md:py-32 [transform:translate3d(0,0,0)]"
      aria-label="Services"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_45%,var(--mad-radial-flower-gold),transparent_65%)]" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 md:px-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.28em] text-mad-gold">
          Capabilities
        </p>
        <h2
          className={cn(
            "mt-4 max-w-2xl text-center font-[family-name:var(--font-display)] text-3xl font-bold uppercase leading-[1.05] tracking-[-0.03em] text-mad-highlight md:text-5xl"
          )}
        >
          One spine. Every surface.
        </h2>

        <div className="relative mx-auto mt-16 h-[min(420px,75vw)] w-full max-w-[520px] md:mt-20 md:h-[440px]">
          {LABELS.map((label, i) => {
            const angle = (i / LABELS.length) * Math.PI * 2 - Math.PI / 2;
            const r = 132;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            return (
              <span
                key={label}
                className="absolute left-1/2 top-1/2 z-[2]"
                style={{
                  transform: `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0)`,
                }}
              >
                <span
                  ref={(n) => {
                    driftRefs.current[i] = n;
                  }}
                  className={cn(
                    "inline-block whitespace-nowrap rounded-full border border-[color:var(--mad-border-accent-heavy)]",
                    "bg-mad-deep px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-mad-aaa-primary backdrop-blur-md md:px-4 md:py-2 md:text-xs"
                  )}
                >
                  {label}
                </span>
              </span>
            );
          })}

          <div className="absolute left-1/2 top-1/2 z-[1] h-36 w-36 -translate-x-1/2 -translate-y-1/2 md:h-48 md:w-48">
            <div
              ref={flowerRef}
              className="relative flex h-full w-full items-center justify-center will-change-transform"
            >
            <div className="absolute inset-0 rounded-full border border-[color:var(--mad-border-gold-muted)]" />
            <div
              className="absolute inset-[10%] rotate-45 rounded-[28%] border-2 border-[color:var(--mad-border-accent-bold)]"
              aria-hidden
            />
            <div
              className="absolute inset-[18%] -rotate-12 rounded-[32%] border border-[color:var(--mad-border-gold-mid)]"
              aria-hidden
            />

            <Image
              src="/madmonos.webp"
              alt=""
              width={579}
              height={744}
              className="relative z-[3] h-24 w-24 object-contain drop-shadow-[var(--mad-drop-image-deep)] md:h-32 md:w-32 gorilla-aura"
            />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
