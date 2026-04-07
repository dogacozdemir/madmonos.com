"use client";

/**
 * Subtle edge darkening — draws the eye to center content; non-interactive.
 */
export function SiteVignette() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[25] [transform:translate3d(0,0,0)]"
      style={{
        background:
          "var(--mad-vignette-edge)",
      }}
      aria-hidden
    />
  );
}
