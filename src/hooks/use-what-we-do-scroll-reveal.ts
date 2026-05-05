"use client";

import { useEffect, useRef } from "react";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";

/**
 * #projects «What we do» — tek tetiklemeli hafif reveal (fade + 20px translateY).
 * Scroll-pin / scrub yok; Lenis ortamında ScrollTrigger ile uyumlu.
 */
export function useWhatWeDoScrollReveal() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        const header = section.querySelector<HTMLElement>("[data-wd-reveal='header']");
        const cards = section.querySelectorAll<HTMLElement>("[data-wd-reveal='card']");
        if (!header && cards.length === 0) return;

        ctx = gsap.context(() => {
          const prep: HTMLElement[] = [];
          if (header) prep.push(header);
          cards.forEach((el) => prep.push(el));
          gsap.set(prep, { opacity: 0, y: 28, force3D: true });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 86%",
              once: true,
              invalidateOnRefresh: true,
            },
          });

          if (header) {
            tl.to(header, { opacity: 1, y: 0, duration: 0.52, ease: "power2.out" });
          }
          if (cards.length) {
            tl.to(
              cards,
              {
                opacity: 1,
                y: 0,
                duration: 0.48,
                stagger: 0.1,
                ease: "power2.out",
              },
              header ? "-=0.12" : 0
            );
          }
        }, section);

        scheduleScrollTriggerRefresh();
      }
    );

    return () => {
      cancelled = true;
      ctx?.revert();
      scheduleScrollTriggerRefresh();
    };
  }, []);

  return sectionRef;
}
