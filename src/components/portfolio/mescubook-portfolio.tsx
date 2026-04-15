"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProjectSlide } from "@/data/digital-present-projects";
import { scheduleScrollTriggerRefresh } from "@/lib/schedule-st-refresh";

import "./portfolio-mescubook.css";

const SWAP = 0.42;
const FLASH_HALF = 0.034;
const DIAL_TICKS = 120;
const TICK_PX = 3 + 2;
const DIAL_VIEW_H = 220;

type ViewMode = "slider" | "list";
type SortMode = "relevance" | "date-desc" | "date-asc";

type Props = {
  projects: readonly ProjectSlide[];
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseYear(y: string): number {
  const m = y.match(/\d{4}/);
  return m ? parseInt(m[0], 10) : 0;
}

function blurHuntOut(t: number, u: number, blurBase: number) {
  if (blurBase < 4) return blurBase;
  const wobble = Math.sin((t / SWAP) * Math.PI * 2 * 9) * 2.4 * Math.sin(Math.PI * u);
  return Math.max(0, blurBase + wobble);
}

function blurHuntIn(t2: number, blurBase: number) {
  if (blurBase < 3) return blurBase;
  const wobble = Math.sin(t2 * Math.PI * 2 * 11) * 2.1 * Math.sin(Math.PI * t2);
  return Math.max(0, blurBase + wobble);
}

function flashStrength(t: number) {
  const d = Math.abs(t - SWAP);
  if (d > FLASH_HALF) return 0;
  return Math.pow(1 - d / FLASH_HALF, 3) * 0.94;
}

function titleFontSizePx(title: string): string {
  const len = title.length;
  if (len > 48) return "clamp(1.85rem, 4.2vw, 3rem)";
  if (len > 32) return "clamp(2.1rem, 5vw, 3.85rem)";
  if (len > 22) return "clamp(2.45rem, 5.8vw, 4.5rem)";
  return "clamp(2.75rem, 6.5vw, 5.1rem)";
}

export function MescubookPortfolio({ projects }: Props) {
  const filmProjects = projects;
  const [viewMode, setViewMode] = useState<ViewMode>("slider");
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [listPreview, setListPreview] = useState<{ src: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const q = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(q.matches);
    if (q.matches) setViewMode("list");
    const onChange = () => {
      setReduceMotion(q.matches);
      if (q.matches) setViewMode("list");
    };
    q.addEventListener("change", onChange);
    return () => q.removeEventListener("change", onChange);
  }, []);

  const listOrdered = useMemo(() => {
    const arr = filmProjects.slice();
    if (sortMode === "relevance") return arr;
    arr.sort((a, b) => parseYear(a.year) - parseYear(b.year));
    if (sortMode === "date-desc") arr.reverse();
    return arr;
  }, [filmProjects, sortMode]);

  const pinRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const dialTrackRef = useRef<HTMLDivElement>(null);
  const counterDigitRef = useRef<HTMLSpanElement>(null);
  const counterBlockRef = useRef<HTMLDivElement>(null);
  const dialBlockRef = useRef<HTMLDivElement>(null);
  const decoLeftRef = useRef<HTMLDivElement>(null);
  const decoTopRef = useRef<HTMLDivElement>(null);
  const titlesRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const yearWrapRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleIdxRef = useRef(0);

  const n = filmProjects.length;

  useEffect(() => {
    wrapRefs.current = wrapRefs.current.slice(0, n);
    innerRefs.current = innerRefs.current.slice(0, n);
  }, [n]);

  const [titleIdx, setTitleIdx] = useState(0);

  useLayoutEffect(() => {
    if (viewMode !== "slider") return;
    const el = counterDigitRef.current;
    if (!el) return;
    void import("gsap").then(({ default: gsap }) => {
      gsap.fromTo(
        el,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.48, ease: "power3.out", overwrite: "auto" }
      );
    });
  }, [titleIdx, viewMode]);

  useEffect(() => {
    titleIdxRef.current = 0;
    setTitleIdx(0);
  }, [filmProjects, viewMode]);

  useEffect(() => {
    if (viewMode !== "slider") return;

    const pin = pinRef.current;
    const flash = flashRef.current;
    const dialTrack = dialTrackRef.current;
    if (!pin) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || n <= 0) return;

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ default: gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const easeIn = gsap.parseEase("power2.in");
      const easeOut = gsap.parseEase("power4.out");

      const getWraps = () => wrapRefs.current.filter(Boolean) as HTMLDivElement[];
      const getInners = () => innerRefs.current.filter(Boolean) as HTMLDivElement[];

      const setIdle = (i: number) => {
        const w = wrapRefs.current[i];
        const inner = innerRefs.current[i];
        if (w) gsap.set(w, { opacity: 0, zIndex: 0 });
        if (inner) {
          gsap.set(inner, {
            scale: 1.08,
            y: 0,
            filter: "blur(16px) brightness(0.8)",
            force3D: true,
          });
        }
      };

      const trackH = DIAL_TICKS * TICK_PX;
      const maxDialY = Math.max(0, trackH - DIAL_VIEW_H * 0.52);

      const syncDialTicks = (progress: number) => {
        if (!dialTrack) return;
        const activeIx = Math.min(DIAL_TICKS - 1, Math.round(progress * (DIAL_TICKS - 1)));
        dialTrack.querySelectorAll<HTMLElement>(".proj__dial-tick").forEach((el, i) => {
          el.classList.toggle("is-active", i === activeIx);
        });
      };

      const applyProgress = (progress: number) => {
        const wraps = getWraps();
        const inners = getInners();
        if (!wraps.length) return;

        if (dialTrack) {
          gsap.set(dialTrack, { y: -progress * maxDialY, force3D: true });
        }
        syncDialTicks(progress);

        if (n === 1) {
          gsap.set(wraps[0], { opacity: 1, zIndex: 2 });
          if (inners[0]) {
            gsap.set(inners[0], {
              scale: 1.08,
              y: 0,
              filter: "blur(0px) brightness(1)",
              force3D: true,
            });
          }
          if (flash) gsap.set(flash, { opacity: 0 });
          return;
        }

        const segments = n - 1;
        const g = progress * segments;
        const seg = Math.min(Math.floor(g), segments - 1);
        const t = g - seg;
        const from = seg;
        const to = seg + 1;

        for (let i = 0; i < n; i++) {
          if (i !== from && i !== to) setIdle(i);
        }

        if (flash) gsap.set(flash, { opacity: flashStrength(t) });

        if (t <= SWAP) {
          const u = easeIn(t / SWAP);
          let blur = 18 * u;
          blur = blurHuntOut(t, u, blur);
          const scale = 1.08 + (1.34 - 1.08) * u;
          const bright = 1 - 0.32 * u;
          const y = -18 * u;

          if (wraps[from]) gsap.set(wraps[from], { opacity: 1, zIndex: 2 });
          if (wraps[to]) gsap.set(wraps[to], { opacity: 0, zIndex: 1 });
          if (inners[from]) {
            gsap.set(inners[from], {
              scale,
              y,
              filter: `blur(${blur}px) brightness(${bright})`,
              force3D: true,
            });
          }
          if (inners[to]) {
            gsap.set(inners[to], {
              scale: 1.22,
              y: -18,
              filter: "blur(18px) brightness(0.68)",
              force3D: true,
            });
          }
        } else {
          const t2 = (t - SWAP) / (1 - SWAP);
          const u = easeOut(t2);
          let blur = 18 * (1 - u);
          blur = blurHuntIn(t2, blur);
          const scale = 1.22 - (1.22 - 1.08) * u;
          const bright = 0.68 + 0.32 * u;
          const y = -18 * (1 - u);

          if (wraps[from]) gsap.set(wraps[from], { opacity: 0, zIndex: 1 });
          if (wraps[to]) gsap.set(wraps[to], { opacity: 1, zIndex: 2 });
          if (inners[to]) {
            gsap.set(inners[to], {
              scale,
              y,
              filter: `blur(${blur}px) brightness(${bright})`,
              force3D: true,
            });
          }
          if (inners[from]) {
            gsap.set(inners[from], {
              scale: 1.34,
              y: -22,
              filter: "blur(20px) brightness(0.55)",
              force3D: true,
            });
          }
        }

        const nextTitle = n === 1 ? 0 : t < SWAP ? from : to;
        if (titleIdxRef.current !== nextTitle) {
          titleIdxRef.current = nextTitle;
          setTitleIdx(nextTitle);
        }
      };

      ctx = gsap.context(() => {
        for (let i = 0; i < n; i++) setIdle(i);
        const wraps = getWraps();
        const inners = getInners();
        if (wraps[0] && inners[0]) {
          gsap.set(wraps[0], { opacity: 1, zIndex: 2 });
          gsap.set(inners[0], {
            scale: 1.08,
            y: 0,
            filter: "blur(0px) brightness(1)",
            force3D: true,
          });
        }
        if (flash) gsap.set(flash, { opacity: 0 });
        if (dialTrack) gsap.set(dialTrack, { y: 0 });

        if (n <= 1) {
          applyProgress(0);
        } else {
          const segments = n - 1;
          /** Kısa mesafe + snap: tek tekerlek / kısa kaydırma ile bir sonraki slayta kilitlenir */
          const pxPerSlide = 112;
          const endDistance = segments * pxPerSlide;
          ScrollTrigger.create({
            trigger: pin,
            start: "top top",
            end: () => `+=${endDistance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.45,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            snap: {
              snapTo: 1 / segments,
              duration: { min: 0.2, max: 0.48 },
              delay: 0.02,
              ease: "power2.inOut",
            },
            onUpdate: (self) => applyProgress(self.progress),
            onRefresh: (self) => applyProgress(self.progress),
          });
          applyProgress(0);
        }
      }, pin);

      requestAnimationFrame(() => scheduleScrollTriggerRefresh());
    });

    return () => {
      cancelled = true;
      ctx?.revert();
      scheduleScrollTriggerRefresh();
    };
  }, [n, filmProjects, viewMode]);

  useEffect(() => {
    if (viewMode !== "slider") return;
    const pin = pinRef.current;
    const titles = titlesRef.current;
    if (!pin || !titles) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)");
    if (reduced || !fine.matches) return;

    let cleanup: (() => void) | undefined;

    void import("gsap").then(({ default: gsap }) => {
      const qTx = gsap.quickTo(titles, "x", { duration: 0.72, ease: "power3.out" });
      const qTy = gsap.quickTo(titles, "y", { duration: 0.72, ease: "power3.out" });
      gsap.set(titles, { x: 0, y: 0, force3D: true });

      const onMove = (e: PointerEvent) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const nx = (e.clientX / w) * 2 - 1;
        const ny = (e.clientY / h) * 2 - 1;
        let ox = nx * 12;
        let oy = ny * 8;
        const r = titles.getBoundingClientRect();
        ox += (e.clientX - (r.left + r.width / 2)) * 0.045;
        oy += (e.clientY - (r.top + r.height / 2)) * 0.038;
        qTx(ox);
        qTy(oy);
      };

      const onLeave = () => {
        qTx(0);
        qTy(0);
      };

      pin.addEventListener("pointermove", onMove, { passive: true });
      pin.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        pin.removeEventListener("pointermove", onMove);
        pin.removeEventListener("pointerleave", onLeave);
        gsap.set(titles, { clearProps: "transform" });
      };
    });

    return () => cleanup?.();
  }, [viewMode, n]);

  const roleLine = (p: ProjectSlide) => p.technicalBadge ?? p.description.split(/[.·]/)[0]?.trim() ?? "—";

  return (
    <div id="mad-portfolio" className="mad-portfolio-scope">
      <section
        ref={pinRef}
        className="proj"
        data-view={viewMode === "slider" ? "slider" : "list"}
        aria-label="Works"
      >
        <div className="proj__glow" aria-hidden />

        <div ref={decoLeftRef} className="proj__deco-left" aria-hidden>
          <span className="proj__vertical-text" data-fr="Sélection — 2022/2026" data-en="Selection — 2022/2026">
            Selection — 2022/2026
          </span>
          <div className="proj__line" />
        </div>

        <div ref={decoTopRef} className="proj__deco-top">
          <div className="proj__sort">
            <span className="proj__sort-label" data-fr="Trier par" data-en="Sort by">
              Sort by
            </span>
            <button
              type="button"
              className={cn("proj__sort-btn", sortMode === "relevance" && "is-active")}
              data-sort="relevance"
              data-fr="Pertinence"
              data-en="Relevance"
              onClick={() => setSortMode("relevance")}
            >
              Relevance
            </button>
            <span className="proj__sort-sep">·</span>
            <button
              type="button"
              className={cn("proj__sort-btn", sortMode === "date-desc" && "is-active")}
              data-sort="date-desc"
              onClick={() => setSortMode("date-desc")}
            >
              Date ↓
            </button>
            <span className="proj__sort-sep">·</span>
            <button
              type="button"
              className={cn("proj__sort-btn", sortMode === "date-asc" && "is-active")}
              data-sort="date-asc"
              onClick={() => setSortMode("date-asc")}
            >
              Date ↑
            </button>
          </div>
          <div className="proj__dash-line" />
          <button
            type="button"
            className="proj__view-toggle"
            aria-label="Switch view"
            disabled={reduceMotion}
            onClick={() => setViewMode((v) => (v === "slider" ? "list" : "slider"))}
          >
            <span
              className={cn("proj__view-opt proj__view-opt--slider", viewMode === "slider" && "is-active")}
              data-fr="Curseur"
              data-en="Slider"
            >
              Slider
            </span>
            <span className="proj__view-sep">·</span>
            <span
              className={cn("proj__view-opt proj__view-opt--list", viewMode === "list" && "is-active")}
              data-fr="Liste"
              data-en="List"
            >
              List
            </span>
          </button>
        </div>

        <div className="proj__deco-corners" aria-hidden>
          <span className="proj__corner proj__corner--tl" />
          <span className="proj__corner proj__corner--tr" />
          <span className="proj__corner proj__corner--bl" />
          <span className="proj__corner proj__corner--br" />
        </div>

        <div className="proj__crosshair" aria-hidden>
          <span />
          <span />
        </div>

        <div className="proj__orbit" aria-hidden>
          <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 6" opacity="0.3" />
            <circle cx="60" cy="10" r="3" fill="currentColor" opacity="0.5" className="proj__orbit-dot" />
          </svg>
        </div>

        <div className="proj__grid-deco" aria-hidden>
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} />
          ))}
        </div>

        <div ref={counterBlockRef} className="proj__counter">
          <div className="proj__counter-num" aria-live="polite">
            <span ref={counterDigitRef} className="proj__counter-current">
              {pad2(titleIdx + 1)}
            </span>
          </div>
          <span className="proj__counter-sep">/</span>
          <span className="proj__counter-total">{pad2(n)}</span>
        </div>

        <div className="proj__list">
          <div
            className={cn("proj__list-img-preview", listPreview && "is-visible")}
            style={
              listPreview
                ? {
                    backgroundImage: `url("${listPreview.src.replace(/"/g, '\\"')}")`,
                    left: listPreview.x + 16,
                    top: listPreview.y + 16,
                  }
                : undefined
            }
            aria-hidden
          />
          <table className="proj__list-table">
            <tbody>
              {listOrdered.map((p, rowIdx) => (
                <tr
                  key={p.id}
                  className="proj__list-row"
                  onMouseEnter={(e) =>
                    setListPreview({ src: p.image, x: e.clientX, y: e.clientY })
                  }
                  onMouseMove={(e) =>
                    setListPreview((prev) =>
                      prev ? { ...prev, x: e.clientX, y: e.clientY } : { src: p.image, x: e.clientX, y: e.clientY }
                    )
                  }
                  onMouseLeave={() => setListPreview(null)}
                >
                  <td className="proj__list-num">{pad2(rowIdx + 1)}</td>
                  <td className="proj__list-name">
                    <Link href={`/portfolio#project-${p.id}`} aria-label={`Open project ${p.title}`}>
                      {p.title}
                    </Link>
                  </td>
                  <td className="proj__list-client">{p.clientCode}</td>
                  <td className="proj__list-role">{roleLine(p)}</td>
                  <td className="proj__list-year">{p.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div ref={flashRef} className="proj__flash" aria-hidden />

        <div ref={stageRef} className="proj__images">
          {filmProjects.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                wrapRefs.current[i] = el;
              }}
              className="proj__img"
              data-index={i}
              aria-hidden={titleIdx !== i}
            >
              <div
                ref={(el) => {
                  innerRefs.current[i] = el;
                }}
                className="proj__img-inner"
              >
                <Image
                  src={p.image}
                  alt={p.imageAlt}
                  width={1600}
                  height={1000}
                  className="object-cover"
                  sizes="(max-width: 768px) 92vw, 52vw"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        <div ref={titlesRef} className="proj__titles">
          {filmProjects.map((p, i) => (
            <h2
              key={p.id}
              className={cn("proj__title", i === titleIdx && "is-active")}
              data-index={i}
              style={{ fontSize: titleFontSizePx(p.title) }}
            >
              {p.title}
            </h2>
          ))}
        </div>

        <div className="proj__underline" aria-hidden />

        <div ref={infoRef} className="proj__info">
          {filmProjects.map((p, i) => (
            <div key={p.id} className={cn("proj__desc", i === titleIdx && "is-active")} data-index={i}>
              <p className="proj__client">{p.clientCode}</p>
              <p className="proj__role">{roleLine(p)}</p>
            </div>
          ))}
        </div>

        <div ref={yearWrapRef} className="proj__year-wrap">
          {filmProjects.map((p, i) => (
            <span key={p.id} className={cn("proj__year", i === titleIdx && "is-active")} data-index={i}>
              {p.year}
            </span>
          ))}
        </div>

        <div ref={dialBlockRef} className="proj__dial" aria-hidden>
          <div ref={dialTrackRef} className="proj__dial-track">
            {Array.from({ length: DIAL_TICKS }, (_, i) => (
              <span key={i} className="proj__dial-tick" />
            ))}
          </div>
        </div>

        <div className="proj__links" aria-hidden>
          {filmProjects.map((p) => (
            <a
              key={p.id}
              className="proj__link"
              data-index={p.id}
              href={`/portfolio#project-${p.id}`}
              aria-label={`View project ${p.title}`}
            />
          ))}
        </div>

        {n > 1 && !reduceMotion && viewMode === "slider" ? (
          <div ref={scrollHintRef} className="proj__scroll-hint">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12l7 7 7-7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Scroll</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
