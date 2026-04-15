"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { DiscoveryTrigger } from "@/components/discovery/discovery-trigger";

/**
 * Mobile-only hero shell — zero video, zero GSAP.
 * Rendered exclusively on mobile UA by the server; desktop never downloads this chunk.
 * CSS @keyframes handle the entry animation (GPU-composited, no JS).
 */
export function HeroMobile() {
  return (
    <section
      id="hero"
      className={cn(
        "relative isolate z-[5] min-h-[100svh] w-full overflow-hidden",
        "[transform:translate3d(0,0,0)]"
      )}
      aria-label="Hero — madmonos"
    >
      {/* LCP element — fetchpriority=high via next/image priority */}
      <Image
        src="/madmonos.webp"
        alt=""
        fill
        sizes="100vw"
        priority
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden
      />

      {/* Cinematic depth gradients */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-mad-void to-transparent"
        aria-hidden
      />

      {/* Brand grain texture */}
      <div
        className="mad-grain pointer-events-none absolute inset-0 opacity-[0.055] mix-blend-soft-light"
        aria-hidden
      />

      {/* Editorial content layer */}
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 pb-28 pt-32">
        {/* Kicker */}
        <p
          className={cn(
            "mb-5 font-mono text-[10px] font-bold uppercase tracking-[0.38em] text-mad-gold",
            "[animation:mad-hero-mob-up_0.72s_cubic-bezier(0.22,1,0.36,1)_0.05s_both]"
          )}
        >
          Digital Agency
        </p>

        {/* Wordmark — primary heading for screen readers */}
        <h1
          id="hero-mobile-heading"
          tabIndex={-1}
          className={cn(
            "text-center font-[family-name:var(--font-display)] font-black uppercase leading-[0.88] tracking-[-0.045em] text-mad-highlight",
            "text-[clamp(3.25rem,17.5vw,6rem)]",
            "[text-shadow:var(--mad-text-shadow-hero)]",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.15s_both]",
            "focus:outline-none"
          )}
        >
          madmonos
        </h1>

        {/* Tagline */}
        <p
          className={cn(
            "mt-6 max-w-[26ch] text-center font-sans text-[0.9375rem] font-medium leading-snug tracking-tight text-mad-aaa-body",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.28s_both]"
          )}
        >
          Creative · Performance · Operations · Technical
        </p>

        {/* CTA */}
        <div
          className={cn(
            "mt-9",
            "[animation:mad-hero-mob-up_0.82s_cubic-bezier(0.22,1,0.36,1)_0.42s_both]"
          )}
        >
          <DiscoveryTrigger id="hero-mobile-cta" variant="gold">
            Start a project
          </DiscoveryTrigger>
        </div>
      </div>

      {/* Scroll hint — hidden from AT; CSS handles reduced-motion via globals.css */}
      <div
        className={cn(
          "pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 z-10",
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
