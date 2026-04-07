"use client";

import { useEffect } from "react";

const LIGHT_IDS = ["#insights"] as const;

/**
 * Light “paper” plane while Impact or Mad Insights is in the viewport band.
 * GSAP yükü ilk paint sonrası ayrı chunk’ta.
 */
export function SitePlaneController() {
  useEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    const raf = requestAnimationFrame(() => {
      void (async () => {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || cancelled) return;

        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);

        const active = new Set<string>();
        const refresh = () => {
          document.body.classList.toggle("site-plane-light", active.size > 0);
        };

        ctx = gsap.context(() => {
          LIGHT_IDS.forEach((sel) => {
            const el = document.querySelector(sel);
            if (!el) return;
            ScrollTrigger.create({
              trigger: el,
              start: "top 65%",
              end: "bottom 35%",
              onEnter: () => {
                active.add(sel);
                refresh();
              },
              onLeave: () => {
                active.delete(sel);
                refresh();
              },
              onEnterBack: () => {
                active.add(sel);
                refresh();
              },
              onLeaveBack: () => {
                active.delete(sel);
                refresh();
              },
            });
          });
        });
      })();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, []);

  return null;
}
