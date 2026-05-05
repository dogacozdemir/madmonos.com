"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TEAM_MEMBERS } from "@/data/team-spotlight";
import { trDisplayUpper } from "@/lib/tr-display";

/**
 * Mobile-only team section — CSS scroll-snap portrait carousel, zero GSAP.
 *
 * Architecture: images scroll, bio text stays fixed below the carousel and
 * transitions to the active member. This keeps the bio always readable and
 * removes the scroll-fighting pattern where bio travelled off-screen with the card.
 *
 * Index calculation uses firstCard.offsetWidth + gap (not clientWidth) so the
 * active card is correct on every viewport width.
 */
export function SpotlightTeamMobile() {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollRafRef = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    setBioExpanded(false);
  }, [activeIdx]);

  useEffect(() => {
    return () => cancelAnimationFrame(scrollRafRef.current);
  }, []);

  const scrollTo = (idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement | undefined;
    if (!card) return;
    card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const onScroll = () => {
    cancelAnimationFrame(scrollRafRef.current);
    scrollRafRef.current = requestAnimationFrame(() => {
      scrollRafRef.current = 0;
      const track = trackRef.current;
      if (!track) return;
      const firstCard = track.children[0] as HTMLElement | undefined;
      if (!firstCard) return;
      const step = firstCard.offsetWidth + 16;
      const idx = Math.round(track.scrollLeft / step);
      setActiveIdx(Math.min(TEAM_MEMBERS.length - 1, Math.max(0, idx)));
    });
  };

  return (
    <section
      id="team-spotlight"
      className="relative z-[24] overflow-hidden bg-mad-void py-16"
      aria-label="Our team — spotlight"
    >
      <p className="px-6 font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-mad-gold">
        Our team
      </p>

      <h2 className="mt-2 px-6 font-[family-name:var(--font-display)] text-[clamp(2rem,8vw,3rem)] font-black uppercase leading-[0.88] tracking-[-0.035em] text-mad-highlight">
        The Minds<br />Behind It All
      </h2>

      <div
        ref={trackRef}
        onScroll={onScroll}
        role="region"
        aria-label="Team member portraits"
        aria-live="polite"
        aria-atomic="false"
        className={cn(
          "mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto",
          "px-6 pb-2",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        )}
      >
        {TEAM_MEMBERS.map((member, i) => (
          <article
            key={member.id}
            aria-label={`${member.name}, ${member.title}`}
            className={cn(
              "relative shrink-0 snap-start w-[76vw] max-w-[304px]",
              "overflow-hidden rounded-2xl",
              "transition-opacity duration-400 ease-out",
              i === activeIdx ? "opacity-100" : "opacity-40"
            )}
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={member.img}
                alt={`${member.name}, ${member.title} — Madmonos`}
                fill
                sizes="76vw"
                className="object-cover object-top"
                priority={i === 0}
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
                aria-hidden
              />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.24em] text-mad-gold">
                  {member.title}
                </p>
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-black leading-[0.9] tracking-[-0.025em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)]">
                  {trDisplayUpper(member.name)}
                </h3>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div
        className="mt-5 flex justify-center gap-2"
        role="group"
        aria-label="Navigate team members"
      >
        {TEAM_MEMBERS.map((member, i) => (
          <button
            key={member.id}
            type="button"
            aria-label={`Go to ${member.name}`}
            aria-current={i === activeIdx ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              "mad-carousel-dot-hit cursor-pointer",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mad-gold"
            )}
          >
            <span
              className={cn(
                "mad-carousel-dot-hit__pill",
                i === activeIdx
                  ? "w-6 bg-mad-gold"
                  : "w-1.5 bg-mad-highlight/25 hover:bg-mad-highlight/50"
              )}
              aria-hidden
            />
          </button>
        ))}
      </div>

      <div className="relative mx-6 mt-6">
        {TEAM_MEMBERS.map((member, i) => {
          const active = i === activeIdx;
          return (
            <div
              key={member.id}
              aria-hidden={!active}
              className={cn(
                "transition-[opacity,transform] duration-350 ease-out",
                active
                  ? "relative opacity-100 translate-y-0"
                  : "pointer-events-none absolute inset-0 opacity-0 translate-y-2"
              )}
            >
              <p
                className={cn(
                  "text-[0.8125rem] leading-relaxed text-mad-aaa-body",
                  !bioExpanded && "line-clamp-4"
                )}
              >
                {member.bio}
              </p>
              <button
                type="button"
                tabIndex={active ? undefined : -1}
                className="mt-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-mad-gold transition-colors hover:text-mad-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mad-gold"
                aria-expanded={bioExpanded}
                onClick={() => setBioExpanded((e) => !e)}
              >
                {bioExpanded ? "Show less" : "Read bio"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
