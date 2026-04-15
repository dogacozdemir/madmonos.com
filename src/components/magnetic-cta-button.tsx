"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  /** Stronger pull for hero footer CTA */
  magnetStrength?: number;
  variant?: "pill" | "circle";
};

const RETURN_EASE = "elastic.out(1, 0.3)";

type GsapT = typeof import("gsap").default;

/** Magnetic pull via GSAP; elastic return off-hover. GSAP chunk yüklemesi effect içinde. */
export function MagneticCtaButton({
  children,
  onClick,
  className,
  magnetStrength,
  variant = "pill",
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const gsapRef = useRef<GsapT | null>(null);
  const hovering = useRef(false);
  const target = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);
  const strength = magnetStrength ?? (variant === "circle" ? 0.78 : 0.52);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      void import("gsap").then(({ default: gsap }) => {
        gsapRef.current = gsap;
        gsap.set(btn, { x: 0, y: 0, force3D: true });
      });
      return;
    }
    const lerp = variant === "circle" ? 0.22 : 0.18;

    let cancelled = false;
    let removeMouse: (() => void) | undefined;

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;
      gsapRef.current = gsap;
      gsap.set(btn, { x: 0, y: 0, force3D: true });

      const step = () => {
        rafRef.current = 0;
        if (!hovering.current || !btnRef.current) return;
        const el = btnRef.current;
        const curX = gsap.getProperty(el, "x") as number;
        const curY = gsap.getProperty(el, "y") as number;
        const tx = target.current.x;
        const ty = target.current.y;
        const nextX = curX + (tx - curX) * lerp;
        const nextY = curY + (ty - curY) * lerp;
        gsap.set(el, { x: nextX, y: nextY, force3D: true });
        const delta = Math.abs(nextX - curX) + Math.abs(nextY - curY);
        const err = Math.abs(tx - nextX) + Math.abs(ty - nextY);
        if (delta > 0.02 || err > 0.25) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      const startLoop = () => {
        if (rafRef.current !== 0) return;
        rafRef.current = requestAnimationFrame(step);
      };

      const onMove = (e: MouseEvent) => {
        if (!hovering.current || !btn) return;
        const r = btn.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        target.current = {
          x: (e.clientX - cx) * strength,
          y: (e.clientY - cy) * strength,
        };
        startLoop();
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      removeMouse = () => {
        window.removeEventListener("mousemove", onMove);
        if (rafRef.current !== 0) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
      };
    });

    return () => {
      cancelled = true;
      removeMouse?.();
    };
  }, [strength, variant]);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        hovering.current = true;
        const g = gsapRef.current;
        const b = btnRef.current;
        if (g && b) g.killTweensOf(b);
      }}
      onMouseLeave={() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        hovering.current = false;
        if (rafRef.current !== 0) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        target.current = { x: 0, y: 0 };
        const b = btnRef.current;
        const g = gsapRef.current;
        if (!b || !g) return;
        g.to(b, {
          x: 0,
          y: 0,
          duration: 1.15,
          ease: RETURN_EASE,
          overwrite: true,
          force3D: true,
        });
      }}
      className={cn(
        "relative z-[3] will-change-transform",
        variant === "circle"
          ? cn(
              "flex h-32 w-32 items-center justify-center rounded-full border-[3px] border-mad-gold bg-mad-gold md:h-40 md:w-40",
              "text-center text-[10px] font-bold uppercase leading-snug tracking-[0.18em] text-mad-base",
              "shadow-[var(--mad-cta-shadow-circle)]"
            )
          : cn(
              "rounded-full border-2 border-mad-gold bg-mad-gold px-10 py-4",
              "text-sm font-bold uppercase tracking-[0.2em] text-mad-base shadow-[var(--mad-cta-shadow-pill)]"
            ),
        className
      )}
    >
      {children}
    </button>
  );
}
