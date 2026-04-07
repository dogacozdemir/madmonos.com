/** Viewport under Tailwind `md` breakpoint (768px). */
export function isMobileViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches
  );
}

/** Lenis / deferred chrome ilk bootstrap: mobilde ana iş parçacığını rahatlatır. */
export function idleBootstrapMs(): number {
  return isMobileViewport() ? 800 : 200;
}
