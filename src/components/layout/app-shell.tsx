"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type AppShellProps = {
  children: React.ReactNode;
  footer: React.ReactNode;
};

/**
 * Fixed footer reveal: main column ends with `margin-bottom` = measured footer height.
 *
 * Footer stays z-0 under the scroll column (z-[2]): if footer z-index were raised above main,
 * a tall fixed footer (marquee + clamps) covers the whole viewport and hides the site.
 *
 * `#main-scroll-surface` uses pointer-events-none so the margin band below the inner column
 * is click-transparent; footer CTAs stay reachable once scrolled into the reveal gap.
 */
/** Matches real footer stack (marquee + links) so first paint marginBottom ≈ final (CLS). */
const FOOTER_RESERVE_MIN = 736;

export function AppShell({ children, footer }: AppShellProps) {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [footerH, setFooterH] = useState(FOOTER_RESERVE_MIN);

  useLayoutEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const measure = () =>
      setFooterH(Math.max(FOOTER_RESERVE_MIN, Math.ceil(el.scrollHeight)));
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen bg-mad-base">
      <div
        className="mad-grain pointer-events-none fixed inset-0 z-[60]"
        aria-hidden
      />

      <div
        ref={footerRef}
        className={cn(
          "fixed inset-x-0 bottom-0 z-0 border-t border-[color:var(--mad-border-accent-mid)] bg-mad-deep",
          "min-h-0 [transform:translate3d(0,0,0)]"
        )}
      >
        {footer}
      </div>

      <div
        id="main-scroll-surface"
        className={cn(
          "relative z-[2] min-h-screen bg-mad-base shadow-[var(--mad-shadow-app-shell)]",
          "pointer-events-none transition-[background-color] duration-500 ease-out"
        )}
        style={{ marginBottom: footerH }}
      >
        <div className="pointer-events-auto">{children}</div>
      </div>
    </div>
  );
}
