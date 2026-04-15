/**
 * Server-side UA detection for device-branch rendering.
 * Used in Server Components (App Router) via `headers()`.
 *
 * Intentionally permissive: tablets are treated as mobile so they receive
 * the lightweight, touch-optimised component tree.
 */
export function isUaMobile(ua: string): boolean {
  return /Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}
