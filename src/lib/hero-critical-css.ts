/**
 * Tiny above-the-fold rules for #hero (full CSS variables load via globals.css).
 * Duplicates only values needed before the main stylesheet paints.
 */
export const HERO_CRITICAL_CSS = [
  ":root{--mch:#3a1d36;--mct:#f3eef8;--mct2:#e8e2ef}",
  "#hero,#hero.main-hero{min-height:100dvh;min-height:100svh;background-color:var(--mch);color:var(--mct2);isolation:isolate}",
  "#hero .main-text{color:var(--mct);font-size:clamp(1.5rem,8vw,2.5rem);line-height:0.85;font-weight:300}",
  "@media(min-width:640px){#hero .main-text{font-size:clamp(1.875rem,min(10.2vw,3.35rem),3.5rem)}}",
  "@media(min-width:768px){#hero .main-text{font-size:clamp(2.75rem,min(18vw,22vmin),15rem)}}",
].join("");
