/**
 * Runs work after the browser is idle (or after `timeout` ms). Polyfilled with setTimeout.
 * Returns a cancel function.
 */
export function runWhenIdle(fn: () => void, timeout = 800): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    const id = ric(() => fn(), { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const tid = window.setTimeout(fn, Math.min(timeout, 400));
  return () => clearTimeout(tid);
}
