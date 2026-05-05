"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TEAM_MEMBERS } from "@/data/team-spotlight";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";
import { trDisplayUpper } from "@/lib/tr-display";
import { useTeamSpotlightNav } from "@/components/providers/team-spotlight-nav-context";

/**
 * Scroll progress 0 → 1 maps to floatIndex 0 → n-1 (equal snap stops across members).
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
  /** Masaüstü 5 kolon grid — ışın yedek merkezleri (figure 0 px ise). */
  const desktopPortraitGridRef = useRef<HTMLDivElement>(null);

  const { setTeamSpotlightActive } = useTeamSpotlightNav();
  const n = TEAM_MEMBERS.length;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const stage = stageRef.current;
    const beamMove = beamMoveRef.current;
    if (!section || !pin || !stage || !beamMove) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobileLayout = window.matchMedia("(max-width: 1023px)").matches;
    const mobileMql = window.matchMedia("(max-width: 1023px)");
    let mobileLayoutActive = mobileMql.matches;

    let reducedIO: IntersectionObserver | null = null;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;

    /**
     * Işın X ofseti: grid geometrisi (padding, column-gap, eşit kolonlar).
     */
    const updateCenters = () => {
      const pr = pin.getBoundingClientRect();
      const pinCX = pr.left + pr.width / 2;
      const gridEl = desktopPortraitGridRef.current;
      if (gridEl) {
        const gr = gridEl.getBoundingClientRect();
        const cs = window.getComputedStyle(gridEl);
        const padL = parseFloat(cs.paddingLeft) || 0;
        const padR = parseFloat(cs.paddingRight) || 0;
        const colGap =
          parseFloat(cs.columnGap) || parseFloat(cs.gap) || 0;
        const innerW = gridEl.clientWidth - padL - padR;
        if (innerW >= 8 && gr.width >= 8) {
          const gutterTotal = colGap * Math.max(0, n - 1);
          const trackW = Math.max(0, (innerW - gutterTotal) / n);
          const contentLeft = gr.left + padL;
          centersRef.current = TEAM_MEMBERS.map((_, i) => {
            const cx = contentLeft + i * (trackW + colGap) + trackW / 2;
            return cx - pinCX;
          });
          return;
        }
      }
      centersRef.current = TEAM_MEMBERS.map((_, i) => {
        const fig = memberRefs.current[i];
        if (!fig) return 0;
        const r = fig.getBoundingClientRect();
        if (r.width < 0.5) return 0;
        return r.left + r.width / 2 - pinCX;
      });
    };

    const raf = requestAnimationFrame(() => {
      void (async () => {
        const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);

        /** Beam offset: interpolate between portrait centers as progress sweeps. */
        const spotlightX = (progress: number) => {
          const centers = centersRef.current;
          if (centers.length < n) return 0;
          const f = progress * (n - 1);
          const i0 = Math.min(n - 1, Math.max(0, Math.floor(f)));
          const i1 = Math.min(n - 1, i0 + 1);
          const t = f - i0;
          return gsap.utils.interpolate(centers[i0]!, centers[i1]!, t);
        };

        const applyMemberAndText = (progress: number) => {
          const floatIndex = progress * (n - 1);
          const mobile = mobileLayoutActive;

          /** Işık/renk vurgusu (grayscale, opacity, parlaklık); büyüme/öne çıkma yok. */
          const styleFigure = (el: HTMLElement | null, i: number) => {
            if (!el) return;
            const w = dwellWeight(i, floatIndex);
            const gray = 1 - w;
            const op = 0.1 + 0.9 * w;
            const br = 1 + 0.2 * w;
            gsap.set(el, {
              filter: `grayscale(${gray}) brightness(${br})`,
              opacity: op,
              scale: 1,
              y: 0,
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
              gsap.set(el, { clearProps: "opacity,filter,scale,transform" });
            });
          } else {
            if (track) gsap.set(track, { xPercent: 0, x: 0 });
            /** Statik grid merkezleri; sonra renk vurgusu, sonra ışın. */
            updateCenters();
            memberRefs.current.forEach((el, i) => styleFigure(el, i));
            gsap.set(beamMove, { x: spotlightX(progress) });
            mobileMemberRefs.current.forEach((el) => {
              if (!el) return;
              gsap.set(el, { clearProps: "opacity,filter,scale,transform" });
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

        ctx = gsap.context(() => {
          const mobileInit = mobileLayoutActive;
          gsap.set(beamMove, { x: mobileInit ? 0 : spotlightX(0) });
          if (mobileTrackRef.current)
            gsap.set(mobileTrackRef.current, { xPercent: 0, x: 0 });

          memberRefs.current.forEach((el) => {
            if (!el) return;
            gsap.set(el, {
              opacity: 0.1,
              filter: "grayscale(1) brightness(1)",
              scale: 1,
              y: 0,
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
              y: 0,
              transformOrigin: "50% 98%",
              force3D: true,
            });
          });

          textBlockRefs.current.forEach((el, i) => {
            if (!el) return;
            gsap.set(el, { xPercent: i * 100, opacity: 1, y: 0 });
          });

          if (reduced) {
            const mob = mobileLayoutActive;
            if (mob) {
              gsap.set(beamMove, { x: 0 });
              if (mobileTrackRef.current) gsap.set(mobileTrackRef.current, { xPercent: 0 });
              mobileMemberRefs.current.forEach((el, i) => {
                if (!el) return;
                const on = i === 0;
                gsap.set(el, {
                  filter: on ? "grayscale(0) brightness(1.2)" : "grayscale(1) brightness(1)",
                  opacity: on ? 1 : 0.1,
                  scale: 1,
                  y: 0,
                  transformOrigin: "50% 98%",
                });
              });
            } else {
              memberRefs.current.forEach((el, i) => {
                if (!el) return;
                const on = i === 0;
                gsap.set(el, {
                  filter: on ? "grayscale(0) brightness(1.2)" : "grayscale(1) brightness(1)",
                  opacity: on ? 1 : 0.1,
                  scale: 1,
                  y: 0,
                  transformOrigin: "50% 98%",
                  force3D: true,
                });
              });
              updateCenters();
              gsap.set(beamMove, { x: spotlightX(0) });
            }
            textBlockRefs.current.forEach((el, i) => {
              if (!el) return;
              const on = i === 0;
              gsap.set(el, { xPercent: i * 100, opacity: on ? 1 : 0, y: 0 });
              el.setAttribute("aria-hidden", on ? "false" : "true");
            });
            return;
          }

          /**
           * scrub:number → gecikmeli progress; Lenis + ters scroll’da tween geride kalıp floatIndex
           * “takılı” kalabiliyordu. snap scroll’u animasyonla çekince Doğaç sonrası geri dönüşte
           * self.progress Hürrem/Ensar’a düzgün eşlenmiyordu.
           * scrub:true = kaydırma ile progress birebir; masaüstünde snap yok (tekrar eklenebilir).
           */
          ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            pin,
            pinSpacing: true,
            scrub: true,
            invalidateOnRefresh: true,
            refreshPriority: -2,
            anticipatePin: 0,
            onUpdate: (self) => {
              applyMemberAndText(self.progress);
            },
            onRefresh: (self) => {
              applyMemberAndText(self.progress);
            },
            onEnter: (self) => {
              setTeamSpotlightActive(true);
              applyMemberAndText(self.progress);
            },
            onLeave: () => setTeamSpotlightActive(false),
            onEnterBack: (self) => {
              setTeamSpotlightActive(true);
              applyMemberAndText(self.progress);
            },
            onLeaveBack: (self) => {
              setTeamSpotlightActive(false);
              applyMemberAndText(self.progress);
            },
          });

          requestAnimationFrame(() => { applyMemberAndText(0); });
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

        scheduleScrollTriggerRefresh();
      })();
    });

    const onLayoutMediaChange = () => {
      mobileLayoutActive = mobileMql.matches;
      scheduleScrollTriggerRefresh();
    };
    mobileMql.addEventListener("change", onLayoutMediaChange);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      mobileMql.removeEventListener("change", onLayoutMediaChange);
      setTeamSpotlightActive(false);
      ctx?.revert();
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

    let tween: { kill: () => void } | null = null;
    let cancelled = false;
    let innerCleanup: (() => void) | null = null;

    const stopTween = () => {
      tween?.kill();
      tween = null;
      turb.setAttribute("baseFrequency", "0.01 0.01");
    };

    void import("gsap").then(({ default: gsap }) => {
      if (cancelled) return;

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

      const io = new IntersectionObserver(
        ([e]) => {
          if (!desktopMql.matches) { stopTween(); return; }
          if (e?.isIntersecting && e.intersectionRatio > 0.04) startTween();
          else stopTween();
        },
        { threshold: [0, 0.04, 0.08] }
      );
      io.observe(section);

      const r = section.getBoundingClientRect();
      if (desktopMql.matches && r.bottom > 0 && r.top < window.innerHeight) {
        startTween();
      }

      const onReduced = () => {
        if (reducedMql.matches) stopTween();
        else if (desktopMql.matches && section.getBoundingClientRect().bottom > 0) startTween();
      };
      reducedMql.addEventListener("change", onReduced);

      const onDesktop = () => {
        if (!desktopMql.matches) stopTween();
        else if (section.getBoundingClientRect().bottom > 0) startTween();
      };
      desktopMql.addEventListener("change", onDesktop);

      innerCleanup = () => {
        io.disconnect();
        reducedMql.removeEventListener("change", onReduced);
        desktopMql.removeEventListener("change", onDesktop);
        stopTween();
      };
    });

    return () => {
      cancelled = true;
      innerCleanup?.();
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
          "relative flex h-screen min-h-[100svh] w-full flex-col overflow-x-clip overflow-y-visible",
          "bg-mad-void"
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
            "font-[family-name:var(--font-display)] text-base font-bold uppercase leading-[1.05] tracking-[0.32em] text-mad-highlight",
            "sm:text-lg sm:tracking-[0.36em] md:text-xl md:tracking-[0.38em] lg:top-[7.5rem] lg:text-2xl lg:tracking-[0.4em]",
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

        <div className="relative z-[8] flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-visible pt-[clamp(8.5rem,18svh,10.5rem)] md:pt-[9.75rem] lg:pt-[10rem]">
          <div
            ref={stageRef}
            className={cn(
              "relative mx-auto flex min-h-0 w-full max-w-[min(100%,1600px)] flex-1 flex-col overflow-x-clip",
              "max-h-[min(76svh,940px)] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] sm:pl-4 sm:pr-4 md:max-h-[min(78svh,1020px)] md:px-8 lg:max-w-[min(97vw,2040px)] lg:px-8 xl:px-10 2xl:max-w-[min(96vw,2240px)]"
            )}
            style={{ perspective: "1400px" }}
          >
            {/* Mobil: tek görünüm, scroll ile şerit sağdan sola; lg+: üye sayısı kadar kolon */}
            <div
              className={cn(
                "relative min-h-0 w-full max-w-full min-w-0 flex-1 overflow-hidden lg:overflow-visible",
                "max-h-[min(58svh,640px)] sm:max-h-[min(60svh,690px)] md:max-h-[min(63svh,740px)] lg:max-h-[min(66svh,800px)] xl:max-h-[min(68svh,840px)] 2xl:max-h-[min(70svh,910px)]",
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
                      className="h-auto max-h-full w-full max-w-[min(100%,448px)] object-contain object-bottom"
                      sizes="(max-width: 768px) min(42vw, 380px), 90vw"
                      priority={i < 2}
                    />
                    <figcaption className="sr-only">
                      {member.name}, {member.title}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div
                ref={desktopPortraitGridRef}
                className={cn(
                  "relative hidden min-h-0 w-full min-w-0 max-w-full flex-1 lg:grid lg:items-end lg:justify-items-center",
                  "gap-[0.35rem] px-1 sm:gap-1.5 sm:px-2 md:gap-3 md:px-3 lg:gap-3 lg:px-2 xl:gap-4 2xl:gap-5"
                )}
                style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
              >
                {TEAM_MEMBERS.map((member, i) => (
                  <figure
                    key={`desk-${member.id}`}
                    ref={(el) => {
                      memberRefs.current[i] = el;
                    }}
                    className={cn(
                      "member-png relative flex h-full min-h-0 w-full min-w-0 max-w-full flex-col items-end justify-end justify-self-stretch will-change-[transform,filter,opacity]",
                      `member-png-${i}`
                    )}
                  >
                    <Image
                      src={member.img}
                      alt={`${member.name}, ${member.title} — Madmonos team portrait`}
                      width={400}
                      height={400}
                      className="h-auto max-h-full w-full max-w-full object-contain object-bottom"
                      sizes="(max-width: 768px) min(44vw, 440px), (max-width: 1024px) 50vw, min(700px, 42vw)"
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
              "relative z-10 w-full max-w-[min(100%,92rem)] shrink-0 px-[max(1rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-[max(1rem,env(safe-area-inset-right))] pt-0 md:mx-auto md:px-12 md:pb-8 2xl:px-16"
            )}
          >
            <div
              className={cn(
                "relative mx-auto min-h-[10.5rem] w-full max-w-[min(100%,76rem)] overflow-x-clip border-t border-[color:var(--mad-border-highlight-soft)] px-6 sm:min-h-[11rem] sm:px-8 md:min-h-[9.75rem] md:px-12 lg:px-14 2xl:max-w-[min(96vw,90rem)]",
                "-translate-y-[clamp(6.5rem,14svh,11rem)] pt-[clamp(3.25rem,7svh,5.25rem)] will-change-transform"
              )}
            >
              {TEAM_MEMBERS.map((member, i) => {
                const nameUpper = trDisplayUpper(member.name);
                return (
                  <div
                    key={member.id}
                    ref={(el) => {
                      textBlockRefs.current[i] = el;
                    }}
                    className={cn(
                      "member-data pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center gap-2 px-5 py-2 text-center will-change-transform sm:gap-2.5 sm:px-6 sm:py-2.5 md:gap-3 md:px-8 md:py-3 lg:px-10",
                      `member-data-${i}`
                    )}
                    aria-hidden={i !== 0}
                  >
                    <div className="flex w-full max-w-full justify-center overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <h3
                        className={cn(
                          "inline-block max-w-none shrink-0 whitespace-nowrap px-2 font-[family-name:var(--font-display)] font-bold leading-[0.92] tracking-[-0.02em] text-mad-highlight",
                          "text-[clamp(2.05rem,min(9vw),4.85rem)] md:text-[clamp(2.35rem,min(8vw),4.95rem)]",
                          "[text-shadow:var(--mad-text-shadow-member-name)]"
                        )}
                      >
                        {nameUpper}
                      </h3>
                    </div>
                    <p className="max-w-xl font-mono text-[10px] font-extrabold uppercase leading-snug tracking-[0.22em] text-mad-gold sm:text-[11px] sm:tracking-[0.24em] md:text-xs md:tracking-[0.28em]">
                      {member.title}
                    </p>
                    <p className="max-w-xl font-sans text-[0.875rem] font-medium leading-snug text-mad-aaa-body sm:text-[0.9375rem] md:leading-relaxed">
                      {member.bio}
                    </p>
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
