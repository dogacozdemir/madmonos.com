"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/**
 * Lightweight route transition: fades main content after client navigations.
 * First paint is unchanged; respects `prefers-reduced-motion`.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const skipFirst = useRef(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

      if (skipFirst.current) {
        skipFirst.current = false;
        gsap.set(el, { opacity: 1 });
        return;
      }

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        gsap.set(el, { opacity: 1 });
        return;
      }

      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.42, ease: "power2.out" });
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div ref={ref} className="flex w-full min-h-min shrink-0 flex-col">
      {children}
    </div>
  );
}
