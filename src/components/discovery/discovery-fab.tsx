"use client";

import { useEffect, useRef } from "react";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { cn } from "@/lib/utils";

/**
 * FAB with mild magnetic pull while hovered (GPU translate3d).
 * RAF runs only during hover when offset is meaningful.
 */
export function DiscoveryFab() {
  const { open, isOpen } = useDiscovery();
  const btnRef = useRef<HTMLButtonElement>(null);
  const hovering = useRef(false);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const rafRef = useRef(0);

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;

    const lerp = 0.16;

    const step = () => {
      rafRef.current = 0;
      if (!hovering.current || !btnRef.current) return;
      const px = pos.current.x;
      const py = pos.current.y;
      pos.current.x += (target.current.x - pos.current.x) * lerp;
      pos.current.y += (target.current.y - pos.current.y) * lerp;
      btnRef.current.style.transform = `translate3d(${pos.current.x}px,${pos.current.y}px,0)`;
      const delta =
        Math.abs(pos.current.x - px) + Math.abs(pos.current.y - py);
      const err =
        Math.abs(target.current.x - pos.current.x) +
        Math.abs(target.current.y - pos.current.y);
      if (delta > 0.015 || err > 0.35) {
        rafRef.current = requestAnimationFrame(step);
      }
    };

    const startLoop = () => {
      if (rafRef.current !== 0) return;
      rafRef.current = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      if (!hovering.current) return;
      const b = btnRef.current;
      if (!b) return;
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      target.current = {
        x: (e.clientX - cx) * 0.42,
        y: (e.clientY - cy) * 0.42,
      };
      startLoop();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current !== 0) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, []);

  if (isOpen) return null;

  return (
    <button
      id="discovery-fab"
      ref={btnRef}
      type="button"
      data-mad-cursor="discover"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="discovery-modal"
      aria-label="Open request callback form"
      onClick={open}
      onMouseEnter={() => {
        hovering.current = true;
      }}
      onMouseLeave={() => {
        hovering.current = false;
        if (rafRef.current !== 0) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = 0;
        }
        target.current = { x: 0, y: 0 };
        pos.current = { x: 0, y: 0 };
        if (btnRef.current) {
          btnRef.current.style.transform = "translate3d(0,0,0)";
        }
      }}
      className={cn(
        "cta-digital-present fixed bottom-6 left-4 z-[70] inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-[color:var(--mad-border-highlight-heavy)] px-5 py-3 will-change-transform md:left-auto md:right-8",
        "bg-mad-deep text-xs font-extrabold uppercase tracking-[0.2em] text-mad-aaa-gold shadow-[var(--mad-fab-shadow)] backdrop-blur-xl"
      )}
      style={{ transform: "translate3d(0,0,0)" }}
    >
      Contact
    </button>
  );
}
