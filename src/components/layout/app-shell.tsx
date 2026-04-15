"use client";

import { cn } from "@/lib/utils";
import { Nav } from "@/components/nav";
import { PageTransition } from "@/components/layout/page-transition";

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
export function AppShell({ children, footer }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-mad-base">
      <div
        className="mad-grain pointer-events-none fixed inset-0 z-[60]"
        aria-hidden
      />

      <div
        id="main-scroll-surface"
        className={cn(
          "relative z-[2] min-h-screen bg-mad-base shadow-[var(--mad-shadow-app-shell)]",
          "pointer-events-none transition-[background-color] duration-500 ease-out"
        )}
      >
        <div className="pointer-events-auto flex w-full flex-col">
          <Nav />
          <PageTransition>{children}</PageTransition>
        </div>
      </div>

      <div
        className={cn(
          "relative z-[1] border-t border-[color:var(--mad-border-accent-mid)] bg-mad-deep",
          "min-h-0 [transform:translate3d(0,0,0)]"
        )}
      >
        {footer}
      </div>
    </div>
  );
}
