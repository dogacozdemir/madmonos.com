/**
 * Lenis + ScrollTrigger ilk ölçümünü font / layout oturduktan sonra çalıştırır (CLS).
 */
export function runAfterLayoutSettled(fn: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  let tid: number | null = null;
  const run = () => {
    tid = window.setTimeout(() => {
      tid = null;
      fn();
    }, 200) as unknown as number;
  };
  if (document.readyState === "complete") {
    run();
  } else {
    window.addEventListener("load", run, { once: true });
  }
  return () => {
    window.removeEventListener("load", run);
    if (tid !== null) window.clearTimeout(tid);
  };
}
