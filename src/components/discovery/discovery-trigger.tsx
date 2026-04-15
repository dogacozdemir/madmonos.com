"use client";

import { useEffect, useRef } from "react";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "gold" | "ghost";
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

    btn.addEventListener("pointerdown", press, { passive: true });
    btn.addEventListener("pointerup", release, { passive: true });
    btn.addEventListener("pointerleave", release, { passive: true });
    btn.addEventListener("pointercancel", release, { passive: true });

    return () => {
      btn.removeEventListener("pointerdown", press);
      btn.removeEventListener("pointerup", release);
      btn.removeEventListener("pointerleave", release);
      btn.removeEventListener("pointercancel", release);
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
        "cta-digital-present inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.15em] transition-colors will-change-transform md:text-sm",
        variant === "gold"
          ? "bg-mad-gold text-mad-base shadow-[var(--mad-shadow-cta-gold-pill)]"
          : "border border-[color:var(--mad-border-accent-heavy)] bg-[color:var(--mad-surface-panel-plum)] text-mad-aaa-primary backdrop-blur-sm",
        className
      )}
    >
      {children ?? "Request callback"}
    </button>
  );
}
