"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  WHAT_WE_DO_SECTION_COPY,
  WHAT_WE_DO_TRINITY_SERVICES,
} from "@/data/mad-genius-copy";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { useWhatWeDoScrollReveal } from "@/hooks/use-what-we-do-scroll-reveal";

function PillarCardGlyph({ kind }: { kind: "ai" | "marfor" | "growth" }) {
  const c = "text-mad-aaa-gold/90";
  if (kind === "ai") {
    return (
      <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3v3M12 18v3M3 12h3M18 12h3M6.3 6.3l2.1 2.1M15.6 15.6l2.1 2.1M6.3 17.7l2.1-2.1M15.6 8.4l2.1-2.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  if (kind === "marfor") {
    return (
      <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 4v4M8 8h8M7 14h10M6 20h12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg className={cn("h-4 w-4 shrink-0", c)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16l4-6 4 3 4-7 4 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function kindFor(id: string): "ai" | "marfor" | "growth" {
  if (id === "ai-creative") return "ai";
  if (id === "marfor-strategy") return "marfor";
  return "growth";
}

/**
 * Hero ↔ Team (`#projects`) — mobil What we do.
 */
export function ProjectsMobile() {
  const pillars = WHAT_WE_DO_TRINITY_SERVICES;
  const copy = WHAT_WE_DO_SECTION_COPY;
  const { open, isOpen } = useDiscovery();
  const sectionRef = useWhatWeDoScrollReveal();

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative z-10 border-b border-[color:var(--mad-border-accent-faint)] bg-mad-base pb-16 pt-20 md:border-y md:pb-20 md:pt-24"
      aria-label="What we do"
    >
      <div className="relative z-20 px-6" data-wd-reveal="header">
        <h2 className="flex flex-col items-center gap-3 pb-20 pt-14 text-center font-[family-name:var(--font-display)] text-[clamp(1.5rem,8vw,2.35rem)] font-bold leading-[1.12] tracking-[-0.03em] md:gap-4 md:pb-24 md:pt-16">
          <span className="text-balance text-mad-aaa-gold">{copy.headlineAccent}</span>
          <span className="text-balance text-mad-highlight">{copy.headlineRest}</span>
        </h2>
      </div>

      <div className="relative z-10 mt-10 flex flex-col gap-6 px-6 md:mt-14">
        {pillars.map((item) => (
          <article
            key={item.id}
            data-wd-reveal="card"
            itemScope
            itemType="https://schema.org/Service"
            className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--mad-border-accent-faint)] bg-mad-void/35 pt-4 shadow-[var(--mad-shadow-chip)] backdrop-blur-xl md:pt-5"
          >
            <meta itemProp="name" content={item.title} />
            <meta itemProp="description" content={item.description} />
            <meta itemProp="image" content={item.image} />

            <div className="relative aspect-[10/9] w-full overflow-hidden border-b border-[color:var(--mad-border-accent-faint)] bg-mad-deep/50">
              <Image
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover object-center"
                sizes="92vw"
                draggable={false}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--mad-base)]/90 via-transparent to-transparent"
                aria-hidden
              />
            </div>

            <div className="flex flex-col p-5">
              <div className="flex items-center gap-2">
                <PillarCardGlyph kind={kindFor(item.id)} />
                <h3 className="font-[family-name:var(--font-display)] text-base font-bold uppercase leading-tight tracking-[-0.02em] text-mad-highlight">
                  {item.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-mad-aaa-body">{item.description}</p>
              <button
                type="button"
                data-mad-cursor="discover"
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls="discovery-modal"
                onClick={open}
                className="group mt-5 inline-flex w-fit items-center gap-2 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-mad-aaa-gold"
              >
                Learn more
                <span className="inline-block" aria-hidden>
                  ↗
                </span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
