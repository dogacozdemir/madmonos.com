"use client";

import { useDiscovery } from "@/components/discovery/discovery-context";
import { FooterMarqueeOnLoad } from "@/components/footer-marquee-on-load";
import { MagneticCtaButton } from "@/components/magnetic-cta-button";

const PHRASES = ["GET IN TOUCH // ", "START A PROJECT // ", "BE MAD // "] as const;
const CYCLE = 18;

function TouchChunks() {
  return (
    <>
      {Array.from({ length: CYCLE }, (_, i) => (
        <span
          key={i}
          className="shrink-0 font-[family-name:var(--font-display)] text-[clamp(1.85rem,7vw,4.5rem)] font-bold uppercase leading-none tracking-[-0.02em] text-mad-highlight antialiased [will-change:transform] [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]"
        >
          {PHRASES[i % PHRASES.length]}
        </span>
      ))}
    </>
  );
}

export function FooterInfiniteCta() {
  const { open } = useDiscovery();

  return (
    <div
      id="contact"
      className="mad-footer-cta-shell relative flex w-full flex-col items-center justify-center gap-6 border-y border-[color:var(--mad-border-accent-soft)] bg-mad-deep py-8 sm:gap-7 sm:py-9 md:gap-8 md:py-10"
    >
      <div className="mad-footer-cta-vignette pointer-events-none absolute inset-0" aria-hidden />

      {/*
        Yatay taşmayı sadece şerit sarıcıda kırp: overflow-hidden shell’de dikeyde
        dairesel CTA ve döndürülmüş tipi kesiyordu.
      */}
      <div className="relative z-0 w-full overflow-x-hidden py-2">
        <FooterMarqueeOnLoad className="footer-touch-arc mad-footer-touch-arc pointer-events-none relative mx-auto w-full shrink-0 select-none">
          <div className="footer-touch-track flex w-max items-center">
            <div className="footer-wave-inner flex w-max shrink-0 items-center leading-none">
              <TouchChunks />
            </div>
            <div className="footer-wave-inner flex w-max shrink-0 items-center leading-none" aria-hidden>
              <TouchChunks />
            </div>
          </div>
        </FooterMarqueeOnLoad>
      </div>

      <div className="relative z-[2] flex shrink-0 flex-col items-center gap-3 px-4 pb-1 md:gap-4">
        <MagneticCtaButton variant="circle" onClick={open} magnetStrength={0.82}>
          Start a
          <br />
          project
        </MagneticCtaButton>
        <p className="max-w-md text-center text-sm font-semibold leading-relaxed text-mad-aaa-primary [text-shadow:0_1px_18px_rgba(0,0,0,0.5)] md:text-base">
          Ready when you are — one brief, one spine, full-stack delivery.
        </p>
      </div>
    </div>
  );
}
