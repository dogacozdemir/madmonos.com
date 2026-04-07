"use client";

import { useEffect, useRef } from "react";

/**
 * Liquid gradient field — RAF runs only while this canvas's **parent** is on-screen (IO).
 * Pointer drift uses parent bounds (not `#hero`). Smoothing is in-RAF (no GSAP — smaller main chunk).
 */
export function HeroGradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const root = document.documentElement;
    const readHexRgb = (varName: string) => {
      const raw = getComputedStyle(root).getPropertyValue(varName).trim();
      const m = /^#([0-9a-f]{6})$/i.exec(raw);
      if (!m) return { r: 0, g: 0, b: 0 };
      const v = m[1];
      return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
      };
    };

    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const reducedMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fineMql = window.matchMedia("(pointer: fine)");
    const reduced = reducedMql.matches;
    const fine = fineMql.matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let t = 0;
    let frameTick = 0;
    let hostVisible = true;

    /** Smoothed pointer 0–1 (replaces gsap.quickTo). */
    const mouse = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    const POINTER_SMOOTH = 0.11;

    const onMove = (e: MouseEvent) => {
      if (!fine || reduced || !hostVisible) return;
      const rect = parent.getBoundingClientRect();
      target.x = clamp01((e.clientX - rect.left) / Math.max(1, rect.width));
      target.y = clamp01((e.clientY - rect.top) / Math.max(1, rect.height));
    };

    const resize = () => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    const paintBlobs = (anim: boolean) => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const mx = mouse.x;
      const my = mouse.y;
      const driftX = (fine && hostVisible ? mx - 0.5 : 0) * w * 0.14;
      const driftY = (fine && hostVisible ? my - 0.5 : 0) * h * 0.12;
      const { r: br, g: bg, b: bb } = readHexRgb("--mad-base");
      const { r: ar, g: ag, b: ab } = readHexRgb("--mad-accent");

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = `rgb(${br},${bg},${bb})`;
      ctx.fillRect(0, 0, w, h);

      const tt = anim ? t : 0;
      const blobs = [
        {
          cx: w * 0.28 + Math.sin(tt * 0.8) * w * 0.06 + driftX * 0.9,
          cy: h * 0.36 + Math.cos(tt * 0.55) * h * 0.05 + driftY * 0.85,
          r: Math.min(w, h) * 0.44,
          deepA: 0.5,
          accentA: 0.38,
        },
        {
          cx: w * 0.74 + Math.cos(tt * 0.65) * w * 0.08 - driftX * 0.35,
          cy: h * 0.48 + Math.sin(tt * 0.42) * h * 0.07 + driftY * 0.45,
          r: Math.min(w, h) * 0.37,
          deepA: 0.44,
          accentA: 0.42,
        },
        {
          cx: w * 0.52 + Math.sin(tt * 0.38) * w * 0.1 + driftX * 0.5,
          cy: h * 0.74 + Math.cos(tt * 0.48) * h * 0.04 - driftY * 0.55,
          r: Math.min(w, h) * 0.52,
          deepA: 0.46,
          accentA: 0.28,
        },
      ];

      for (const b of blobs) {
        const g = ctx.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, b.r);
        g.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${b.deepA})`);
        g.addColorStop(0.48, `rgba(${ar}, ${ag}, ${ab}, ${b.accentA})`);
        g.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.cx, b.cy, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      if (!hostVisible || reducedMql.matches) {
        raf = 0;
        return;
      }
      if (fine && !reducedMql.matches) {
        mouse.x += (target.x - mouse.x) * POINTER_SMOOTH;
        mouse.y += (target.y - mouse.y) * POINTER_SMOOTH;
      }
      frameTick += 1;
      if (frameTick % 2 === 0) {
        t += 0.0008;
        paintBlobs(true);
      }
      raf = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (reducedMql.matches || !hostVisible || raf) return;
      raf = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      paintBlobs(false);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        const next = !!entry?.isIntersecting;
        if (hostVisible !== next) {
          hostVisible = next;
          if (hostVisible) startLoop();
          else stopLoop();
        }
      },
      { root: null, threshold: [0, 0.05] }
    );
    io.observe(parent);

    const onReducedChange = () => {
      if (reducedMql.matches) stopLoop();
      else if (hostVisible) startLoop();
    };
    reducedMql.addEventListener("change", onReducedChange);

    resize();

    requestAnimationFrame(() => {
      const r = parent.getBoundingClientRect();
      hostVisible = r.bottom > 8 && r.top < window.innerHeight - 8;
      if (hostVisible && !reducedMql.matches) startLoop();
    });

    if (reducedMql.matches) {
      paintBlobs(false);
      const ro = new ResizeObserver(() => {
        resize();
        paintBlobs(false);
      });
      ro.observe(parent);
      return () => {
        ro.disconnect();
        io.disconnect();
        reducedMql.removeEventListener("change", onReducedChange);
      };
    }

    if (fine) {
      parent.addEventListener("mousemove", onMove, { passive: true });
    }

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);

    if (hostVisible) startLoop();

    return () => {
      stopLoop();
      ro.disconnect();
      io.disconnect();
      reducedMql.removeEventListener("change", onReducedChange);
      if (fine) parent.removeEventListener("mousemove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" aria-hidden />;
}
