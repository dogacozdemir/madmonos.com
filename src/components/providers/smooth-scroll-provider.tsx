"use client";

import { useEffect } from "react";
import { runAfterLayoutSettled } from "@/lib/layout-settled";
import { idleBootstrapMs } from "@/lib/mobile-perf";
import { runWhenIdle } from "@/lib/run-when-idle";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";

/**
 * Lenis + ScrollTrigger.scrollerProxy — virtual scroll ↔ GSAP stay in sync.
 * GSAP + Lenis yükü ilk boyamadan sonra ayrı chunk’ta (daha küçük ana paket).
 * @see https://github.com/darkroomengineering/lenis#gsap-scrolltrigger
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    /** Mobil / dokunmatik: native scroll; Lenis + ScrollTrigger proxy yok (paket + iş parçacığı). */
    const allowLenis =
      window.matchMedia("(pointer: fine)").matches &&
      window.matchMedia("(min-width: 768px)").matches;
    if (!allowLenis) return;

    let cancelled = false;
    let innerTeardown: (() => void) | undefined;
    let cancelIdle: (() => void) | undefined;

    const startLenis = () => {
      if (cancelled) return;

      void (async () => {
        const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis/dist/lenis.css"),
        ]);

        if (cancelled) return;

        gsap.registerPlugin(ScrollTrigger);
        ScrollTrigger.config({
          limitCallbacks: true,
          ignoreMobileResize: true,
        });

        const scroller = document.documentElement;
        let touchRefreshOnce: (() => void) | null = null;

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          smoothWheel: true,
          touchMultiplier: 1.6,
        });

        ScrollTrigger.scrollerProxy(scroller, {
          scrollTop(value) {
            if (arguments.length && typeof value === "number") {
              lenis.scrollTo(value, { immediate: true });
            }
            return lenis.scroll;
          },
          getBoundingClientRect() {
            return {
              top: 0,
              left: 0,
              width: window.innerWidth,
              height: window.innerHeight,
            };
          },
          pinType: document.body.style.transform ? "transform" : "fixed",
        });

        ScrollTrigger.defaults({ scroller });

        lenis.on("scroll", ScrollTrigger.update);

        const tickerCb = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerCb);
        gsap.ticker.lagSmoothing(0);

        const onRefresh = () => {
          lenis.resize();
          scheduleScrollTriggerRefresh();
        };
        window.addEventListener("resize", onRefresh);

        requestAnimationFrame(() => {
          scheduleScrollTriggerRefresh();
        });

        if (window.matchMedia("(max-width: 767px)").matches) {
          const onFirstTouch = () => {
            scheduleScrollTriggerRefresh();
            if (touchRefreshOnce) {
              document.removeEventListener("touchstart", touchRefreshOnce, true);
              touchRefreshOnce = null;
            }
          };
          touchRefreshOnce = onFirstTouch;
          document.addEventListener("touchstart", onFirstTouch, {
            capture: true,
            passive: true,
          });
        }

        const delayedRefresh = window.setTimeout(() => {
          lenis.resize();
          scheduleScrollTriggerRefresh();
        }, 500);

        const layoutSync = window.setTimeout(() => {
          lenis.resize();
          ScrollTrigger.sort();
          scheduleScrollTriggerRefresh();
        }, 1000);

        innerTeardown = () => {
          if (touchRefreshOnce) {
            document.removeEventListener("touchstart", touchRefreshOnce, true);
            touchRefreshOnce = null;
          }
          window.clearTimeout(delayedRefresh);
          window.clearTimeout(layoutSync);
          window.removeEventListener("resize", onRefresh);
          gsap.ticker.remove(tickerCb);
          lenis.destroy();
          ScrollTrigger.scrollerProxy(scroller, {});
          ScrollTrigger.defaults({ scroller: window });
          ScrollTrigger.clearScrollMemory("manual");
          ScrollTrigger.refresh();
        };
      })();
    };

    const cancelLayoutWait = runAfterLayoutSettled(() => {
      cancelIdle = runWhenIdle(() => {
        if (!cancelled) startLenis();
      }, idleBootstrapMs());
    });

    return () => {
      cancelled = true;
      cancelLayoutWait();
      cancelIdle?.();
      innerTeardown?.();
    };
  }, []);

  return <>{children}</>;
}
