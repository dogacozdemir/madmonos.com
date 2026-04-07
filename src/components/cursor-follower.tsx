"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  view: "VIEW",
  discover: "DISCOVER",
};

/**
 * Golden ring + wash; on interactive targets ring tints --mad-accent and label reads crystal-clear.
 */
export function CursorFollower() {
  const washRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const frame = useRef<number>(0);
  const hover = useRef({ active: false, mode: "view" as "view" | "discover" });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (mq.matches || !fine.matches) return;

    document.body.classList.add("mad-cursor-ring");

    const wash = washRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!wash || !ring || !label) return;

    let targetScale = 1;

    const targetUnder = (e: MouseEvent) => {
      const raw = document.elementFromPoint(e.clientX, e.clientY);
      let el: HTMLElement | null = raw as HTMLElement | null;
      while (el && el !== document.body) {
        const tag = el.tagName;
        if (
          el.dataset.madCursor === "view" ||
          el.dataset.madCursor === "discover"
        ) {
          return el.dataset.madCursor as "view" | "discover";
        }
        if (
          tag === "BUTTON" ||
          tag === "A" ||
          el.getAttribute("role") === "button" ||
          el.dataset.madCursor === "interactive"
        ) {
          return "view" as const;
        }
        el = el.parentElement;
      }
      return null;
    };

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      const mode = targetUnder(e);
      if (mode) {
        hover.current = { active: true, mode };
        targetScale = mode === "discover" ? 2.35 : 2.05;
        label.textContent = LABELS[mode] ?? "VIEW";
      } else {
        hover.current.active = false;
        targetScale = 1;
      }
    };

    const lerp = 0.14;
    let ringScale = 1;
    let labelOp = 0;
    let ticking = false;

    const tick = () => {
      if (document.hidden) {
        ticking = false;
        return;
      }
      ticking = true;
      const hot = hover.current.active;

      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      const wx = pos.current.x + (target.current.x - pos.current.x) * 0.35;
      const wy = pos.current.y + (target.current.y - pos.current.y) * 0.35;
      wash.style.transform = `translate3d(${wx}px,${wy}px,0) translate(-50%, -50%)`;
      ringScale += (targetScale - ringScale) * 0.12;
      ring.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%, -50%) scale(${ringScale})`;

      ring.classList.toggle("mad-cursor-ring--hot", hot);
      label.classList.toggle("mad-cursor-label--hot", hot);

      labelOp += ((hover.current.active ? 1 : 0) - labelOp) * 0.14;
      label.style.opacity = String(labelOp);
      label.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%, 18px)`;

      frame.current = requestAnimationFrame(tick);
    };

    const ensureTick = () => {
      if (!document.hidden && !ticking) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame.current);
        ticking = false;
      } else {
        ensureTick();
      }
    };

    const onEnter = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      pos.current = { ...target.current };
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onEnter);
    document.addEventListener("visibilitychange", onVis);
    ensureTick();

    return () => {
      document.body.classList.remove("mad-cursor-ring");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("visibilitychange", onVis);
      cancelAnimationFrame(frame.current);
      ticking = false;
    };
  }, []);

  return (
    <>
      <div
        ref={washRef}
        aria-hidden={true}
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[45] hidden h-[min(42vw,320px)] w-[min(42vw,320px)] rounded-full md:block",
          "opacity-75 [transform:translate3d(0,0,0)] [will-change:transform]",
          "mad-cursor-wash-bg",
          "blur-[28px] mix-blend-screen"
        )}
      />
      <div
        ref={ringRef}
        aria-hidden={true}
        className={cn(
          "mad-cursor-ring-el pointer-events-none fixed left-0 top-0 z-[46] hidden md:block",
          "[transform:translate3d(0,0,0)] [will-change:transform]",
          "h-9 w-9 rounded-full border-2 border-[color:var(--mad-border-gold-ring)] opacity-80 mix-blend-normal"
        )}
      />
      <span
        ref={labelRef}
        aria-hidden={true}
        className={cn(
          "mad-cursor-label pointer-events-none fixed left-0 top-0 z-[46] hidden font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-mad-gold opacity-0 md:block",
          "[will-change:opacity,transform] mix-blend-normal [text-shadow:var(--mad-cursor-label-glow)]"
        )}
      />
    </>
  );
}
