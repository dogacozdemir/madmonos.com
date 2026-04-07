"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { TEAM_MEMBERS } from "@/data/team-spotlight";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";
import { useTeamSpotlightNav } from "@/components/providers/team-spotlight-nav-context";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll progress 0 → 1 maps to floatIndex 0 → 3 (thirds: 0%, 33.3%, 66.6%, 100% on members).
 * Plateau keeps the active character (and copy) parked longer — snap on ScrollTrigger does the rest.
 */
function dwellWeight(i: number, floatIndex: number, plateau = 0.34) {
  const d = Math.abs(floatIndex - i);
  if (d <= plateau) {
    const e = d / plateau;
    return 1 - e * e * 0.12;
  }
  const falloff = (d - plateau) / (1 - plateau);
  return Math.max(0, (1 - falloff) ** 2.6);
}

function splitDisplayName(fullName: string): { line1: string; line2: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { line1: fullName, line2: "" };
  }
  const line2 = parts.pop() ?? "";
  const line1 = parts.join(" ");
  return { line1, line2 };
}

export function SpotlightTeamStage() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  /** Dış: pin merkezinde sabit; iç: GSAP x — aynı elemanda `-translate-x-1/2` + `x` kullanmak transform'u ezerdi */
  const beamMoveRef = useRef<HTMLDivElement>(null);
  const memberRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileMemberRefs = useRef<(HTMLElement | null)[]>([]);
  const mobileTrackRef = useRef<HTMLDivElement | null>(null);
  const centersRef = useRef<number[]>([]);
  const textBlockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dustTurbulenceRef = useRef<SVGFETurbulenceElement>(null);

  const { setTeamSpotlightActive } = useTeamSpotlightNav();
  const n = TEAM_MEMBERS.length;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const stage = stageRef.current;
    const beamMove = beamMoveRef.current;
    if (!section || !pin || !stage || !beamMove) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let reducedIO: IntersectionObserver | null = null;

    /**
     * Takım portrelerinin (ör. 400×400 WebP) boyalı piksellerinin X merkezi, pin yatay merkezine göre (px).
     * Işın `pin` üzerinde `left-1/2 -translate-x-1/2` ile sabitlendiği için ölçüm de pin ile hizalı olmalı.
     */
    const updateCenters = () => {
      const pr = pin.getBoundingClientRect();
      const pinCX = pr.left + pr.width / 2;
      centersRef.current = TEAM_MEMBERS.map((_, i) => {
        const fig = memberRefs.current[i];
        if (!fig) return 0;
        const img = fig.querySelector("img");
        const r = (img ?? fig).getBoundingClientRect();
        const imgCX = r.left + r.width / 2;
        return imgCX - pinCX;
      });
    };

    /** Işın kayması: karakter merkezine (pin merkezinden px offset) */
    const spotlightX = (progress: number) => {
      const centers = centersRef.current;
      if (centers.length < n) return 0;
      const f = progress * (n - 1);
      const i0 = Math.min(n - 1, Math.max(0, Math.floor(f)));
      const i1 = Math.min(n - 1, i0 + 1);
      const t = f - i0;
      return gsap.utils.interpolate(centers[i0]!, centers[i1]!, t);
    };

    const isMobileTeamLayout = () =>
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 1023px)").matches;

    const applyMemberAndText = (progress: number) => {
      const floatIndex = progress * (n - 1);
      const mobile = isMobileTeamLayout();
      const narrow =
        typeof window !== "undefined" && window.matchMedia("(max-width: 480px)").matches;

      const styleFigure = (el: HTMLElement | null, i: number) => {
        if (!el) return;
        const w = dwellWeight(i, floatIndex);
        const gray = 1 - w;
        const op = 0.1 + 0.9 * w;
        const sc = 1 + (narrow || mobile ? 0.06 : 0.1) * w;
        const br = 1 + 0.2 * w;
        gsap.set(el, {
          filter: `grayscale(${gray}) brightness(${br})`,
          opacity: op,
          scale: sc,
          transformOrigin: "50% 98%",
          force3D: true,
        });
      };

      const track = mobileTrackRef.current;

      if (mobile) {
        if (track) gsap.set(track, { xPercent: -progress * ((n - 1) / n) * 100, x: 0 });
        gsap.set(beamMove, { x: 0 });
        mobileMemberRefs.current.forEach((el, i) => styleFigure(el, i));
        memberRefs.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { clearProps: "opacity,filter,scale" });
        });
      } else {
        if (track) gsap.set(track, { xPercent: 0, x: 0 });
        updateCenters();
        gsap.set(beamMove, { x: spotlightX(progress) });
        memberRefs.current.forEach((el, i) => styleFigure(el, i));
        mobileMemberRefs.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { clearProps: "opacity,filter,scale" });
        });
      }

      textBlockRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = Math.abs(floatIndex - i);
        gsap.set(el, {
          xPercent: (i - floatIndex) * 100,
          opacity: 1,
          y: 0,
          force3D: true,
          pointerEvents: d < 0.52 ? "auto" : "none",
        });
        el.setAttribute("aria-hidden", d > 0.52 ? "true" : "false");
      });
    };

    const ctx = gsap.context(() => {
      const mobileInit = isMobileTeamLayout();
      gsap.set(beamMove, { x: mobileInit ? 0 : spotlightX(0) });
      if (mobileTrackRef.current)
        gsap.set(mobileTrackRef.current, { xPercent: 0, x: 0 });

      memberRefs.current.forEach((el) => {
        if (!el) return;
        gsap.set(el, {
          opacity: 0.1,
          filter: "grayscale(1) brightness(1)",
          scale: 1,
          transformOrigin: "50% 98%",
          force3D: true,
        });
      });

      mobileMemberRefs.current.forEach((el) => {
        if (!el) return;
        gsap.set(el, {
          opacity: 0.1,
          filter: "grayscale(1) brightness(1)",
          scale: 1,
          transformOrigin: "50% 98%",
          force3D: true,
        });
      });

      textBlockRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, {
          xPercent: (i - 0) * 100,
          opacity: 1,
          y: 0,
        });
      });

      if (reduced) {
        const mob = isMobileTeamLayout();
        if (mob) {
          gsap.set(beamMove, { x: 0 });
          if (mobileTrackRef.current) gsap.set(mobileTrackRef.current, { xPercent: 0 });
          mobileMemberRefs.current.forEach((el, i) => {
            if (!el) return;
            const on = i === 0;
            gsap.set(el, {
              filter: on
                ? "grayscale(0) brightness(1.2)"
                : "grayscale(1) brightness(1)",
              opacity: on ? 1 : 0.1,
              scale: on ? 1.1 : 1,
              transformOrigin: "50% 98%",
            });
          });
        } else {
          updateCenters();
          gsap.set(beamMove, { x: spotlightX(0) });
          memberRefs.current.forEach((el, i) => {
            if (!el) return;
            const on = i === 0;
            gsap.set(el, {
              filter: on
                ? "grayscale(0) brightness(1.2)"
                : "grayscale(1) brightness(1)",
              opacity: on ? 1 : 0.1,
              scale: on ? 1.1 : 1,
              transformOrigin: "50% 98%",
            });
          });
        }
        textBlockRefs.current.forEach((el, i) => {
          if (!el) return;
          const on = i === 0;
          gsap.set(el, { xPercent: i * 100, opacity: on ? 1 : 0, y: 0 });
          el.setAttribute("aria-hidden", on ? "false" : "true");
        });
        return;
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          pin: pin,
          pinSpacing: true,
          scrub: 1.15,
          snap: {
            snapTo: [0, 1 / 3, 2 / 3, 1],
            duration: { min: 0.28, max: 0.62 },
            delay: 0.04,
            ease: "power3.inOut",
          },
          invalidateOnRefresh: true,
          refreshPriority: -2,
          anticipatePin: 0,
          onUpdate: (self) => applyMemberAndText(self.progress),
          onRefresh: (self) => {
            applyMemberAndText(self.progress);
          },
          onEnter: () => setTeamSpotlightActive(true),
          onLeave: () => setTeamSpotlightActive(false),
          onEnterBack: () => setTeamSpotlightActive(true),
          onLeaveBack: () => setTeamSpotlightActive(false),
        },
      });

      requestAnimationFrame(() => {
        applyMemberAndText(0);
      });
    }, section);

    if (reduced) {
      reducedIO = new IntersectionObserver(
        ([e]) => {
          setTeamSpotlightActive(!!(e?.isIntersecting && e.intersectionRatio > 0.04));
        },
        { threshold: [0, 0.04, 0.12] }
      );
      reducedIO.observe(section);
    }

    const teamLayoutMql = window.matchMedia("(max-width: 1023px)");
    const onTeamLayoutChange = () => scheduleScrollTriggerRefresh();
    teamLayoutMql.addEventListener("change", onTeamLayoutChange);

    scheduleScrollTriggerRefresh();

    return () => {
      teamLayoutMql.removeEventListener("change", onTeamLayoutChange);
      setTeamSpotlightActive(false);
      ctx.revert();
      reducedIO?.disconnect();
    };
  }, [n, setTeamSpotlightActive]);

  useEffect(() => {
    const turb = dustTurbulenceRef.current;
    const section = sectionRef.current;
    if (!turb || !section) return;

    const reducedMql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopMql = window.matchMedia("(min-width: 768px)");
    if (reducedMql.matches) return;

    turb.setAttribute("baseFrequency", "0.01 0.01");

    let tween: gsap.core.Tween | null = null;
    const startTween = () => {
      if (!desktopMql.matches || tween) return;
      tween = gsap.to(turb, {
        attr: { baseFrequency: "0.015 0.015" },
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    };
    const stopTween = () => {
      if (tween) {
        tween.kill();
        tween = null;
      }
      turb.setAttribute("baseFrequency", "0.01 0.01");
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!desktopMql.matches) {
          stopTween();
          return;
        }
        if (e?.isIntersecting && e.intersectionRatio > 0.04) startTween();
        else stopTween();
      },
      { threshold: [0, 0.04, 0.08] }
    );
    io.observe(section);

    const r = section.getBoundingClientRect();
    if (
      desktopMql.matches &&
      r.bottom > 0 &&
      r.top < window.innerHeight
    ) {
      startTween();
    }

    const onReduced = () => {
      if (reducedMql.matches) stopTween();
      else if (desktopMql.matches && section.getBoundingClientRect().bottom > 0)
        startTween();
    };
    reducedMql.addEventListener("change", onReduced);

    const onDesktop = () => {
      if (!desktopMql.matches) stopTween();
      else if (section.getBoundingClientRect().bottom > 0) startTween();
    };
    desktopMql.addEventListener("change", onDesktop);

    return () => {
      io.disconnect();
      reducedMql.removeEventListener("change", onReduced);
      desktopMql.removeEventListener("change", onDesktop);
      stopTween();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="team-spotlight"
      className="relative z-[24] h-[450vh] min-h-[450vh] w-full"
      aria-label="Our team — spotlight"
    >
      <div
        ref={pinRef}
        className={cn(
          "relative flex h-screen min-h-[100svh] w-full flex-col overflow-hidden",
          "sticky top-0 bg-mad-void"
        )}
      >
        <svg
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
          aria-hidden={true}
        >
          <defs>
            <filter
              id="madSpotlightDust"
              x="-30%"
              y="-30%"
              width="160%"
              height="160%"
            >
              <feTurbulence
                ref={dustTurbulenceRef}
                type="fractalNoise"
                baseFrequency="0.01 0.01"
                numOctaves="2"
                stitchTiles="stitch"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="4"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
        {/* Below site header (z-50); cleared from nav pill — no overlap */}
        <p
          className={cn(
            "pointer-events-none absolute left-1/2 z-20 w-[min(calc(100%-1.5rem),80rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 text-center",
            "top-[clamp(5.5rem,11svh,7.75rem)]",
            "font-[family-name:var(--font-display)] text-sm font-bold uppercase leading-[1.05] tracking-[0.32em] text-mad-highlight",
            "sm:text-base sm:tracking-[0.36em] md:text-lg md:tracking-[0.4em] lg:top-[7.5rem] lg:text-xl",
            "[text-shadow:var(--mad-text-shadow-spot-kicker)]"
          )}
        >
          Our team
        </p>

        <div className="pointer-events-none absolute inset-0 bg-mad-void" aria-hidden />
        <div className="mad-spot-void-orb pointer-events-none absolute inset-0" aria-hidden />

        {/* Tilted stage plane */}
        <div
          className="mad-spot-stage-plane pointer-events-none absolute inset-x-[-12%] bottom-0 z-[4] h-[46%] will-change-[transform,opacity] [transform:translate3d(0,0,0)]"
          style={{
            transform: "perspective(1100px) rotateX(11deg) scale(1.14, 1.02)",
            transformOrigin: "50% 100%",
          }}
          aria-hidden
        />

        {/* Sharp golden spotlight — outer: pin merkezi; inner: GSAP x (ikisi tek div’de transform çakışması yapmasın) */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 z-[5] h-[108%] w-[min(92vw,780px)] max-w-[1240px] -translate-x-1/2 sm:w-[min(74vw,780px)] lg:w-[min(54vw,820px)] 2xl:max-w-[min(56vw,1180px)]"
          aria-hidden
        >
          <div
            ref={beamMoveRef}
            className="relative h-full w-full will-change-[transform,filter] max-md:[filter:none] md:[filter:url(#madSpotlightDust)]"
          >
            <div className="mad-spot-beam-gold absolute left-1/2 top-[-6%] h-full w-full -translate-x-1/2 opacity-[0.95]" />
            <div className="mad-spot-beam-warm absolute left-1/2 top-0 h-[92%] w-[42%] -translate-x-1/2" />
          </div>
        </div>

        <div
          className="mad-grain pointer-events-none absolute inset-0 z-[6] opacity-[0.07] mix-blend-soft-light"
          aria-hidden
        />

        <div className="relative z-[8] flex min-h-0 flex-1 flex-col overflow-hidden overscroll-none pt-[clamp(8.5rem,18svh,10.5rem)] md:pt-[9.75rem] lg:pt-[10rem]">
          <div
            ref={stageRef}
            className={cn(
              "relative mx-auto flex min-h-0 w-full max-w-[min(100%,1600px)] flex-1 flex-col overflow-x-clip overscroll-none",
              "max-h-[min(62svh,720px)] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-4 sm:pr-4 md:max-h-[min(64svh,800px)] md:px-8 lg:max-w-[min(94vw,1800px)] lg:px-12 xl:px-14 2xl:max-w-[min(92vw,1920px)]"
            )}
            style={{ perspective: "1400px" }}
          >
            {/* Mobil: tek görünüm, scroll ile şerit sağdan sola; lg+: 4 sütun grid */}
            <div
              className={cn(
                "relative min-h-0 w-full min-w-0 max-w-full flex-1 overflow-hidden",
                "max-h-[min(52svh,560px)] sm:max-h-[min(55svh,620px)] md:max-h-[min(58svh,660px)] lg:max-h-[min(60svh,720px)] xl:max-h-[min(62svh,760px)] 2xl:max-h-[min(64svh,820px)]",
                "pt-3 sm:pt-4 md:pt-5 lg:pt-6"
              )}
              style={{
                transform: "rotateX(3.5deg)",
                transformOrigin: "50% 100%",
                transformStyle: "preserve-3d",
              }}
            >
              <div
                ref={mobileTrackRef}
                className={cn(
                  "relative flex h-full w-full will-change-transform lg:hidden"
                )}
                style={{ width: `${n * 100}%` }}
              >
                {TEAM_MEMBERS.map((member, i) => (
                  <figure
                    key={member.id}
                    ref={(el) => {
                      mobileMemberRefs.current[i] = el;
                    }}
                    className={cn(
                      "member-png member-png-mobile relative flex h-full min-h-0 shrink-0 flex-col items-center justify-end px-2 will-change-[transform,filter,opacity]",
                      `member-png-${i}`
                    )}
                    style={{ flex: `0 0 ${100 / n}%` }}
                  >
                    <Image
                      src={member.img}
                      alt={`${member.name}, ${member.title} — Madmonos team portrait`}
                      width={400}
                      height={400}
                      className="h-auto max-h-full w-full max-w-[min(100%,420px)] object-contain object-bottom"
                      sizes="(max-width: 768px) min(40vw, 360px), 90vw"
                      priority={i < 2}
                    />
                    <figcaption className="sr-only">
                      {member.name}, {member.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div
                className={cn(
                  "relative hidden min-h-0 w-full min-w-0 max-w-full flex-1 lg:grid lg:grid-cols-4 lg:items-end lg:justify-items-center",
                  "gap-[0.35rem] px-1 sm:gap-1.5 sm:px-2 md:gap-3 md:px-3 lg:gap-6 lg:px-4 xl:gap-8 2xl:gap-10"
                )}
              >
                {TEAM_MEMBERS.map((member, i) => (
                  <figure
                    key={`desk-${member.id}`}
                    ref={(el) => {
                      memberRefs.current[i] = el;
                    }}
                    className={cn(
                      "member-png relative flex h-full min-h-0 w-full min-w-0 max-w-full flex-col items-end justify-end justify-self-stretch will-change-[transform,filter,opacity]",
                      `member-png-${i}`,
                      i === 0 ? "" : "opacity-[0.1] [filter:grayscale(1)]"
                    )}
                  >
                    <Image
                      src={member.img}
                      alt={`${member.name}, ${member.title} — Madmonos team portrait`}
                      width={400}
                      height={400}
                      className="h-auto max-h-full w-full max-w-full object-contain object-bottom"
                      sizes="(max-width: 768px) min(40vw, 400px), (max-width: 1024px) 46vw, min(580px, 36vw)"
                      priority={i < 2}
                    />
                    <figcaption className="sr-only">
                      {member.name}, {member.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>

          {/* Editorial grid — legs clear, dense type, max-w-7xl */}
          <div
            className={cn(
              "relative z-10 -mt-2 w-full max-w-[min(100%,92rem)] shrink-0 px-[max(1rem,env(safe-area-inset-left))] pb-[max(1rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-1 sm:-mt-3 sm:pt-1 md:mx-auto md:px-12 md:pb-10 md:pt-2 2xl:px-16"
            )}
          >
            <div className="relative mx-auto min-h-[12.5rem] w-full max-w-7xl overflow-x-clip border-t border-[color:var(--mad-border-highlight-soft)] sm:min-h-[13rem] md:min-h-[11.5rem] 2xl:max-w-[min(80rem,94vw)]">
              {TEAM_MEMBERS.map((member, i) => {
                const { line1, line2 } = splitDisplayName(member.name);
                return (
                  <div
                    key={member.id}
                    ref={(el) => {
                      textBlockRefs.current[i] = el;
                    }}
                    className={cn(
                      "member-data pointer-events-none absolute inset-x-0 top-0 grid grid-cols-1 content-start gap-3 py-3 will-change-transform sm:gap-4 sm:py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:items-start md:gap-x-16 md:gap-y-2 md:py-5 lg:gap-x-20",
                      `member-data-${i}`
                    )}
                    aria-hidden={i !== 0}
                  >
                    <div className="name-column min-w-0 -mt-2 md:-mt-5">
                      <h3
                        className={cn(
                          "font-[family-name:var(--font-display)] font-bold uppercase leading-[0.88] tracking-[-0.035em] text-mad-highlight",
                          "text-[clamp(3rem,5vw,6rem)] md:text-[clamp(3rem,4.5vw,5.75rem)]",
                          "[text-shadow:var(--mad-text-shadow-member-name)]"
                        )}
                      >
                        <span className="block">{line1}</span>
                        {line2 ? (
                          <span className="mt-1 block text-[clamp(1.5rem,calc(2.8vw_+_0.5rem),3.25rem)] tracking-[-0.03em] text-mad-highlight">
                            {line2}
                          </span>
                        ) : null}
                      </h3>
                    </div>
                    <div className="flex min-w-0 flex-col gap-2.5 md:gap-3 md:pt-1">
                      <p className="font-mono text-[10px] font-extrabold uppercase leading-snug tracking-[0.22em] text-mad-gold sm:text-[11px] sm:tracking-[0.24em] md:text-xs md:tracking-[0.28em]">
                        {member.title}
                      </p>
                      <p className="max-w-xl font-sans text-[0.875rem] font-medium leading-snug text-mad-aaa-body sm:text-[0.9375rem] md:leading-relaxed">
                        {member.bio}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
