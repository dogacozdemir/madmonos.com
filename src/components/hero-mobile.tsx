"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DiscoveryTrigger } from "@/components/discovery/discovery-trigger";

/** Matches nav header “chameleon” pill (liquid glass). */
const heroLiquidGlassCta = cn(
  "!border-white/10 !bg-mad-deep/30 !text-mad-aaa-primary !shadow-none",
  "!inline-flex !min-h-12 !items-center !justify-center !rounded-full !px-5 !py-3 !text-xs !font-bold !uppercase !tracking-[0.14em]",
  "!backdrop-blur-xl !backdrop-saturate-[1.8]",
  "[transform:translateZ(0)] [will-change:backdrop-filter] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]",
  "transition-[color,background-color,border-color] duration-300 hover:!border-white/20 hover:!text-mad-gold",
  "[transform:translate3d(0,0,0)]"
);

/** H.264 fallback — universal decode */
const HERO_VIDEO_H264 = "/videos/hero5.mp4";
/** H.265/HEVC — smaller at similar quality on Safari / many modern iOS & Android devices */
const HERO_VIDEO_HEVC = "/videos/hero5-hevc.mp4";
/** Mobile-sized poster (~864×486, ~14 KiB) — avoids decoding 1920×1080 for LCP. */
const HERO_POSTER = "/videos/cover5-hero-864.jpg";

/** Parallax factor (transform-only, rAF-throttled scroll — no layout reads). */
const PARALLAX_Y = 0.036;

/**
 * Mobile-only hero — cinematic video, scan/grain; wordmark + slogan parallax (transform-only).
 */
export function HeroMobile() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wordmarkParallaxRef = useRef<HTMLDivElement>(null);
  const sloganParallaxRef = useRef<HTMLDivElement>(null);
  const [motionOk, setMotionOk] = useState(true);

  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!motionOk) return;
    const existing = document.querySelector(`link[rel="preload"][href="${HERO_POSTER}"]`);
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = HERO_POSTER;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, [motionOk]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !motionOk) return;
    queueMicrotask(() => {
      v.muted = true;
      v.setAttribute("playsinline", "");
      v.playsInline = true;
      v.loop = true;
      v.preload = "metadata";
      v.setAttribute("fetchpriority", "high");
      void v.play().catch(() => {});
    });
  }, [motionOk]);

  useEffect(() => {
    if (!motionOk) return;
    let raf = 0;
    const tick = () => {
      const y = window.scrollY;
      const dy = y * PARALLAX_Y;
      const word = wordmarkParallaxRef.current;
      const slogan = sloganParallaxRef.current;
      if (word) word.style.transform = `translate3d(0,${dy}px,0)`;
      if (slogan) slogan.style.transform = `translate3d(0,${dy}px,0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [motionOk]);

  return (
    <section
      id="hero"
      className={cn(
        "relative isolate z-[5] min-h-[100svh] w-full overflow-hidden",
        "[transform:translate3d(0,0,0)]"
      )}
      aria-label="Hero — madmonos"
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 min-h-full bg-mad-void"
        aria-hidden
      >
        {motionOk ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover opacity-80"
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
            poster={HERO_POSTER}
          >
            <source src={HERO_VIDEO_HEVC} type="video/mp4; codecs=hvc1" />
            <source src={HERO_VIDEO_H264} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={HERO_POSTER}
            alt=""
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            className="object-cover opacity-80"
          />
        )}
      </div>

      {motionOk ? (
        <>
          <div
            className="mad-hero-scan-hum-layer pointer-events-none absolute inset-0 z-[2]"
            aria-hidden
          />
          <div
            className="mad-grain pointer-events-none absolute inset-0 z-[7] opacity-[0.13] mix-blend-soft-light [transform:translate3d(0,0,0)]"
            aria-hidden
          />
        </>
      ) : null}

      <div
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-black/60 via-black/25 to-black/78"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] h-52 bg-gradient-to-t from-mad-void to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pb-28 pt-32">
        <div
          ref={wordmarkParallaxRef}
          className={cn(
            "[transform:translate3d(0,0,0)]",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.12s_both]"
          )}
        >
          <h1
            id="hero-mobile-heading"
            tabIndex={-1}
            className={cn(
              "hero-wordmark mad-wordmark main-text heading w-full max-w-full",
              "text-[clamp(1.85rem,9.2vw,3rem)]",
              "sm:text-[clamp(1.125rem,min(11vw,3.75rem),4rem)]",
              "[text-shadow:0_8px_28px_rgba(0,0,0,0.55),0_2px_10px_rgba(0,0,0,0.45)]",
              "[filter:drop-shadow(0_0_10px_rgba(10,6,12,0.36))]",
              "lowercase",
              "focus:outline-none"
            )}
          >
            madmonos
          </h1>
        </div>

        <div
          ref={sloganParallaxRef}
          className={cn(
            "mt-3 max-w-[min(92vw,24rem)] px-1 [transform:translate3d(0,0,0)]",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.26s_both]"
          )}
        >
          <p
            className={cn(
              "text-center font-[family-name:var(--font-montserrat)] text-[1.0625rem] font-medium leading-snug tracking-[-0.02em] text-mad-aaa-body",
              "sm:text-[1.125rem]",
              "[text-shadow:var(--mad-text-shadow-hero-tagline)]",
              "antialiased"
            )}
          >
            Adapting brands to the AI era.
          </p>
        </div>

        <div
          className={cn(
            "mt-10",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.38s_both]"
          )}
        >
          <DiscoveryTrigger id="hero-mobile-cta" variant="ghost" className={heroLiquidGlassCta}>
            Book a demo
          </DiscoveryTrigger>
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2",
          "[animation:mad-hero-mob-up_1s_cubic-bezier(0.22,1,0.36,1)_0.7s_both]",
          "motion-reduce:hidden"
        )}
        aria-hidden="true"
      >
        <div className="h-5 w-[1.5px] rounded-full bg-mad-highlight/30 [animation:mad-hero-mob-scroll_1.8s_ease-in-out_1.4s_infinite]" />
      </div>
    </section>
  );
}
