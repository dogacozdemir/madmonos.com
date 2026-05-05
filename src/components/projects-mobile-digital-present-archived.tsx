/**
 * ARŞİV — Önceki “Selected work”: `DIGITAL_PRESENT_PROJECTS` tam ekran kartları.
 * Aktif: `projects-mobile.tsx` (What we do · Trinity).
 */

"use client";

import Image from "next/image";
import { DIGITAL_PRESENT_PROJECTS } from "@/data/digital-present-projects";

const IMG_SIZES = "(max-width: 768px) 92vw, 50vw";

/**
 * Mobile-native project showcase — full-bleed editorial cards.
 * Portrait-crop image fills the card; all text overlays the gradient inside.
 * Ghost project number anchors each card typographically (brand identity preserved).
 * No horizontal scroll, no flip, no arrow navigation.
 */
export function ProjectsMobileDigitalPresentArchived() {
  return (
    <section
      id="projects"
      className="relative z-[30] border-y border-[color:var(--mad-border-accent-faint)] bg-mad-base py-10"
      aria-label="Selected work"
    >
      <div className="px-6 pb-7">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-mad-aaa-gold">
          Selected work
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.5rem)] font-bold uppercase leading-[1.06] tracking-[-0.03em] text-mad-highlight">
          Selected work
        </h2>
      </div>

      <div className="flex flex-col gap-4 px-4">
        {DIGITAL_PRESENT_PROJECTS.map((slide) => (
          <article
            key={slide.id}
            className="group relative overflow-hidden rounded-2xl border border-[color:var(--mad-border-gold-dim)] shadow-[var(--mad-shadow-elevated)] [transform:translate3d(0,0,0)]"
            aria-label={`${slide.clientCode}: ${slide.title}`}
          >
            {/* Portrait-crop image — fills the entire card */}
            <div className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.imageAlt}
                width={slide.width}
                height={slide.height}
                sizes={IMG_SIZES}
                quality={75}
                className="absolute inset-0 h-full w-full object-cover object-center"
                draggable={false}
              />

              {/* Ghost project number — large typographic anchor, brand identity */}
              <span
                className="pointer-events-none absolute left-3 top-2 select-none font-[family-name:var(--font-display)] text-[7rem] font-black leading-none tracking-[-0.06em] text-white/[0.06]"
                aria-hidden
              >
                {slide.id}
              </span>

              {/* Technical badge */}
              {slide.technicalBadge ? (
                <div className="absolute right-3 top-3 rounded-full border border-[color:var(--mad-border-gold-strong)] bg-mad-deep/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-mad-aaa-gold backdrop-blur-md">
                  {slide.technicalBadge}
                </div>
              ) : null}

              {/* Rich bottom gradient — text lives here, not below the image */}
              <div
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-4 pb-5 pt-20"
                aria-hidden={false}
              >
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-mad-aaa-gold/80">
                  {slide.clientCode}
                  {slide.year ? (
                    <span className="ml-2 text-white/40">· {slide.year}</span>
                  ) : null}
                </p>
                <h3 className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(1.15rem,5.8vw,1.5rem)] font-bold uppercase leading-[1.05] tracking-[-0.025em] text-white">
                  {slide.title}
                </h3>
                <p className="mt-1.5 max-w-[42ch] text-[11px] font-normal leading-snug text-white/55">
                  {slide.description}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
