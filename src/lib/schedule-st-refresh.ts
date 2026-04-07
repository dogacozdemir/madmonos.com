import { idleBootstrapMs } from "@/lib/mobile-perf";
import { runWhenIdle } from "@/lib/run-when-idle";

let debounce: number | null = null;

/** Debounced idle refresh — ana iş parçacığında ani reflow yükünü azaltır */
export function scheduleScrollTriggerRefresh() {
  if (typeof window === "undefined") return;
  if (debounce !== null) window.clearTimeout(debounce);
  debounce = window.setTimeout(() => {
    debounce = null;
    runWhenIdle(() => {
      void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
        ScrollTrigger.refresh();
      });
    }, idleBootstrapMs());
  }, 150) as unknown as number;
}
