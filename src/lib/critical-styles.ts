import { HERO_CRITICAL_CSS } from "@/lib/hero-critical-css";

/**
 * Üst katman / LCP öncesi: hero kritik CSS + sabit header iskeleti (Tailwind tam gelmeden yer ayrılır).
 */
const NAV_SHELL_CRITICAL =
  "header{position:fixed;inset:0 0 auto 0;z-index:50;width:100%;box-sizing:border-box}";

export const CRITICAL_INLINE_CSS = `${HERO_CRITICAL_CSS}${NAV_SHELL_CRITICAL}`;
