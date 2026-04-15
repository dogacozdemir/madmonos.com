/**
 * Vertical offset for scrollable content below the fixed `Nav`.
 * Mirrors `nav.tsx`: `paddingTop: calc(safe + 2rem)` + inner bar `h-[70px]`, plus a readable gap.
 */
export const navClearancePaddingClass =
  "pt-[calc(env(safe-area-inset-top,0px)+2rem+4.375rem+2.5rem)] sm:pt-[calc(env(safe-area-inset-top,0px)+2rem+4.375rem+2.75rem)]";

/** `scroll-margin-top` for in-page anchors under the fixed bar (slightly tighter than full padding). */
export const navClearanceScrollMarginClass =
  "scroll-mt-[calc(env(safe-area-inset-top,0px)+2rem+4.375rem+0.5rem)]";
