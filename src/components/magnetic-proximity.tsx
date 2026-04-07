"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Cursor distance from element center at which pull is full (px) */
  radius?: number;
  /** Max translate toward cursor (px scale) */
  pull?: number;
};

const RETURN_EASE = "elastic.out(1, 0.3)";
const PULL_DURATION = 0.38;

/**
 * Magnetic pull — power3 while aiming; elastic premium return to origin.
 * GSAP ilk paint sonrası yüklenir (`pointer: fine` ve sakin hareket yoksa chunk hiç istenmez).
 */
export function MagneticProximity({ children, className, radius = 50, pull = 0.42 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)");
    if (reduced || !fine.matches) return;

    const child = wrap.firstElementChild as HTMLElement | null;
    if (!child) return;

    let cancelled = false;
    let removeListeners: (() => void) | undefined;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      gsap.set(child, { x: 0, y: 0, force3D: true });

      const maxDist = radius + Math.max(wrap.offsetWidth, wrap.offsetHeight) / 2;

      const onMove = (e: MouseEvent) => {
        const r = wrap.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist && dist > 0.5) {
          const falloff = 1 - dist / maxDist;
          const p = falloff * falloff * pull;
          gsap.to(child, {
            x: dx * p,
            y: dy * p,
            duration: PULL_DURATION,
            ease: "power3.out",
            overwrite: "auto",
            force3D: true,
          });
        } else {
          gsap.to(child, {
            x: 0,
            y: 0,
            duration: 1.18,
            ease: RETURN_EASE,
            overwrite: "auto",
            force3D: true,
          });
        }
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      removeListeners = () => {
        window.removeEventListener("mousemove", onMove);
        gsap.killTweensOf(child);
        gsap.set(child, { clearProps: "transform" });
      };
    });

    return () => {
      cancelled = true;
      removeListeners?.();
    };
  }, [pull, radius]);

  return (
    <div ref={wrapRef} className={cn(className)}>
      {children}
    </div>
  );
}
