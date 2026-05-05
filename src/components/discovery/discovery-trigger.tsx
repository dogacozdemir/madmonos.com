"use client";

import { useEffect, useRef } from "react";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "gold" | "ghost";
  /** Slower, layered gold luminance — use on hero primary CTA */
  premiumGlow?: boolean;
};

type GsapT = typeof import("gsap").default;

/**
 * Primary conversion CTA.
 *
 * Micro-interaction (deferred GSAP pattern):
 *   pointerdown → scale(0.92) in 80ms — tactile press confirmation
 *   pointerup   → elastic.out(1, 0.42) spring return — emotionally resonant release
 *
 * GSAP chunk is lazily imported on the first pointer event, adding zero weight
 * to the initial paint. prefers-reduced-motion is respected.
 */
export function DiscoveryTrigger({
  id,
  className,
  children,
  variant = "gold",
  premiumGlow = false,
}: Props) {
  const { open, isOpen } = useDiscovery();
  const btnRef = useRef<HTMLButtonElement>(null);
  const gsapRef = useRef<GsapT | null>(null);
  const armedRef = useRef(false);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const arm = () => {
      if (armedRef.current) return;
      armedRef.current = true;
      void import("gsap").then(({ default: gsap }) => {
        gsapRef.current = gsap;
        gsap.set(btn, { force3D: true });
      });
    };

    const goldRipple = (ev: PointerEvent) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const prev = btn.querySelectorAll(".mad-cta-gold-ripple");
        if (prev.length > 4) prev[0]?.remove();
        const ring = document.createElement("span");
        ring.setAttribute("aria-hidden", "true");
        ring.className = "pointer-events-none absolute mad-cta-gold-ripple";
        ring.style.left = `${x - 22}px`;
        ring.style.top = `${y - 22}px`;
        btn.appendChild(ring);
        void import("gsap").then(({ default: gsap }) => {
          gsap.fromTo(
            ring,
            { scale: 0.15, opacity: 0.52 },
            {
              scale: 2.85,
              opacity: 0,
              duration: 0.55,
              ease: "power2.out",
              force3D: true,
              transformOrigin: "50% 50%",
              onComplete: () => ring.remove(),
            }
          );
        });
      });
    };

    const press = () => {
      arm();
      const gsap = gsapRef.current;
      if (!gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to(btn, {
        scale: 0.92,
        duration: 0.08,
        ease: "power2.out",
        overwrite: true,
        force3D: true,
      });
    };

    const release = () => {
      const gsap = gsapRef.current;
      if (!gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.to(btn, {
        scale: 1,
        duration: 0.68,
        ease: "elastic.out(1, 0.42)",
        overwrite: true,
        force3D: true,
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      goldRipple(e);
      press();
    };

    btn.addEventListener("pointerdown", onPointerDown, { passive: true });
    btn.addEventListener("pointerup", release, { passive: true });
    btn.addEventListener("pointerleave", release, { passive: true });
    btn.addEventListener("pointercancel", release, { passive: true });

    return () => {
      btn.removeEventListener("pointerdown", onPointerDown);
      btn.removeEventListener("pointerup", release);
      btn.removeEventListener("pointerleave", release);
      btn.removeEventListener("pointercancel", release);
      void import("gsap").then(({ default: gsap }) => {
        btn.querySelectorAll(".mad-cta-gold-ripple").forEach((el) => {
          gsap.killTweensOf(el);
        });
      });
      btn.querySelectorAll(".mad-cta-gold-ripple").forEach((el) => el.remove());
    };
  }, []);

  return (
    <button
      ref={btnRef}
      id={id}
      type="button"
      data-mad-cursor="discover"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="discovery-modal"
      onClick={open}
      className={cn(
        "cta-digital-present relative overflow-visible inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.15em] transition-colors will-change-transform md:text-sm",
        "touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "gold"
          ? cn(
              "focus-visible:ring-[color:var(--mad-base)] focus-visible:ring-offset-[color:var(--mad-gold)]",
              "bg-mad-gold text-mad-base",
              premiumGlow ? "mad-cta-premium-glow" : "shadow-[var(--mad-shadow-cta-gold-pill)] mad-cta-gold-pulse"
            )
          : cn(
              "focus-visible:ring-[color:var(--mad-gold)] focus-visible:ring-offset-[color:var(--mad-surface-panel-plum)]",
              "border border-[color:var(--mad-border-accent-heavy)] bg-[color:var(--mad-surface-panel-plum)] text-mad-aaa-primary backdrop-blur-sm"
            ),
        className
      )}
    >
      {children ?? "Request callback"}
    </button>
  );
}
