const STACK = [
  "Next.js 16",
  "Python 3.12",
  "PyTorch",
  "OpenAI",
  "Meta Ads API",
  "AWS",
  "Docker",
  "Vercel",
  "GSAP",
  "Lenis",
  "Tailwind CSS",
] as const;

function StackChips({ dup }: { dup?: boolean }) {
  return (
    <>
      {STACK.map((label) => (
        <span
          key={`${dup ? "b" : "a"}-${label}`}
          className="mad-stack-chip shrink-0 rounded-full border border-[color:var(--mad-border-gold-mid)] bg-[color:rgba(6,3,8,0.72)] px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-mad-gold shadow-[0_0_28px_rgba(201,174,85,0.08)] backdrop-blur-md md:px-5 md:text-xs md:tracking-[0.2em]"
          style={{ textShadow: "var(--mad-text-shadow-marquee-gold)" }}
        >
          {label}
        </span>
      ))}
    </>
  );
}

/**
 * #marquee — “Stack” nav target. Dual segments + CSS marquee match footer pattern (reliable -50% loop).
 */
export function MarTechMarquee() {
  return (
    <section
      id="marquee"
      className="mad-stack-section relative isolate z-[30] scroll-mt-[5.5rem] overflow-x-hidden border-y border-[color:var(--mad-border-gold-soft)] py-14 md:py-20"
      aria-labelledby="marquee-stack-title"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-mad-void via-mad-deep to-mad-void opacity-[0.97]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,rgba(156,112,178,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--mad-border-gold-mid)] to-transparent opacity-80"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-6xl px-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">

        <div className="mad-stack-marquee-viewport relative -mx-4 min-h-[4.5rem] overflow-hidden sm:mx-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-12 bg-gradient-to-r from-mad-void to-transparent sm:w-16 md:w-24"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-12 bg-gradient-to-l from-mad-void to-transparent sm:w-16 md:w-24"
            aria-hidden
          />

          <div className="mad-marquee-track flex w-max items-center gap-0">
            <div className="mad-marquee-segment flex w-max shrink-0 items-center gap-3 pr-4 md:gap-4 md:pr-6">
              <StackChips />
            </div>
            <div
              className="mad-marquee-segment mad-marquee-segment--dup flex w-max shrink-0 items-center gap-3 pr-4 md:gap-4 md:pr-6"
              aria-hidden
            >
              <StackChips dup />
            </div>
          </div>
        </div>

        <p className="mt-8 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-mad-gold md:text-[11px]">
          Trust &amp; technical proof
        </p>
      </div>
    </section>
  );
}
