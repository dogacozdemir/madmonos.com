"use client";

import { cn } from "@/lib/utils";
import { MORPHING_SERVICES } from "@/data/mad-genius-copy";

/**
 * Mobile-native services list — single vertical scroll, no GSAP, no scroll trap.
 * Replaces the 500vh HorizontalServiceScroll section on mobile UA.
 * Every service is immediately readable: no pinning, no interaction required.
 */
export function ServicesMobile() {
  return (
    <section
      id="services"
      className="relative z-[25] border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base"
      aria-label="Services"
    >
      <div className="px-6 pb-5 pt-12">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-mad-aaa-body">
          Services
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.5rem)] font-bold uppercase leading-[1.06] tracking-[-0.03em] text-mad-highlight">
          What we offer
        </h2>
      </div>

      <div className="divide-y divide-[color:var(--mad-border-accent-faint)]">
        {MORPHING_SERVICES.map((service, i) => (
          <div
            key={service.id}
            className={cn(
              "flex items-start gap-4 px-6 py-5",
              "[transform:translate3d(0,0,0)]"
            )}
          >
            <span
              className="shrink-0 pt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mad-aaa-gold"
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase leading-tight tracking-[-0.02em] text-mad-highlight">
                {service.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mad-aaa-body">
                {service.description}
              </p>
              {service.technicalBadge ? (
                <span className="mt-3 inline-flex items-center rounded-full border border-[color:var(--mad-border-gold-mid)] bg-mad-deep/50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-mad-aaa-gold">
                  {service.technicalBadge}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
