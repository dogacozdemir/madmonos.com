/**
 * Turkish-aware display casing. Avoid pairing with Tailwind `uppercase` — CSS uses English
 * titlecase rules (`i` → `I` instead of `İ`).
 */
export function trDisplayUpper(s: string): string {
  return s.trim().toLocaleUpperCase("tr-TR");
}
