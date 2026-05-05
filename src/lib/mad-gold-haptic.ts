/**
 * Single-shot gold border + inner luminance on package cards (pointer feedback).
 * GPU-friendly: short box-shadow burst; skipped when reduced-motion is set.
 */
export function playGoldBorderFlash(target: HTMLElement): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  void import("gsap").then(({ default: gsap }) => {
    gsap.killTweensOf(target, "boxShadow");
    const prev = target.style.boxShadow;
    gsap.fromTo(
      target,
      {
        boxShadow:
          "0 0 0 1px rgba(201, 174, 85, 0.25), inset 0 0 0 0 rgba(201, 174, 85, 0)",
      },
      {
        boxShadow:
          "0 0 32px rgba(201, 174, 85, 0.45), inset 0 0 36px rgba(201, 174, 85, 0.14)",
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        onComplete: () => {
          target.style.boxShadow = prev;
        },
      }
    );
  });
}
