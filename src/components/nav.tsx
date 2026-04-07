"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { DiscoveryTrigger } from "@/components/discovery/discovery-trigger";
import { useDiscovery } from "@/components/discovery/discovery-context";
import { MagneticProximity } from "@/components/magnetic-proximity";
import { useTeamSpotlightNavOptional } from "@/components/providers/team-spotlight-nav-context";

const CONTACT_MAIL = "mailto:hello@madmonos.com";

/** GPU-friendly shell: blur samples page behind; translateZ promotes layer. */
const navChameleonGpu =
  "[transform:translateZ(0)] [will-change:backdrop-filter] [-webkit-backface-visibility:hidden] [backface-visibility:hidden]";

const navChameleonTint = "bg-mad-deep/30";

const links: {
  href: string;
  label: string;
  subLabel: string;
  ariaLabel?: string;
}[] = [
  { href: "#hero", label: "Hero", subLabel: "START YOUR JOURNEY" },
  { href: "#projects", label: "Projects", subLabel: "CASE STUDIES" },
  { href: "#impact", label: "Impact", subLabel: "SIGNAL & SCALE" },
  { href: "#services", label: "Services", subLabel: "WHAT WE DO" },
  { href: "#insights", label: "Insights", subLabel: "LATEST NEWS" },
  {
    href: "#marquee",
    label: "Runtime",
    subLabel: "PRODUCTION TOOLING",
    ariaLabel: "Production tooling and stack",
  },
];

const tapHaptic =
  "transition-transform duration-150 ease-out will-change-transform active:scale-[0.96] motion-reduce:active:scale-100";

function MenuArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 shrink-0 text-mad-gold/90", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ChameleonEdgeShade({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-r from-black/40 via-transparent to-black/40",
        className
      )}
      aria-hidden
    />
  );
}

export function Nav() {
  const teamNav = useTeamSpotlightNavOptional();
  const teamSpotlightActive = teamNav?.teamSpotlightActive ?? false;
  const { open: openDiscovery } = useDiscovery();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 box-border w-full px-4 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))] md:px-8",
          navChameleonGpu
        )}
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 2rem)",
        }}
      >
        <div
          className={cn(
            "relative mx-auto h-[70px] max-w-4xl min-w-0 overflow-hidden rounded-full border border-white/10 opacity-100",
            navChameleonTint,
            "backdrop-blur-2xl backdrop-saturate-[1.8]",
            navChameleonGpu,
            teamSpotlightActive && "border-white/20 shadow-[var(--mad-shadow-nav-ring)] ring-1 ring-white/[0.08]"
          )}
        >
          <ChameleonEdgeShade className="z-0" />
          <div className="relative z-[1] grid h-full min-h-0 w-full grid-cols-3 items-stretch gap-2 px-2 sm:gap-3 sm:px-4">
            <div className="flex min-h-0 min-w-0 items-center justify-start">
              <Link
                href="/"
                className={cn(
                  "inline-flex size-11 shrink-0 items-center justify-center text-mad-highlight sm:size-12",
                  tapHaptic
                )}
                aria-label="madmonos — home"
              >
                <Image
                  src="/logo-nav.webp"
                  alt=""
                  width={80}
                  height={102}
                  sizes="(max-width: 768px) 32px, 36px"
                  className="h-7 w-auto max-h-7 object-contain sm:h-8 sm:max-h-8"
                  priority
                  fetchPriority="high"
                  loading="eager"
                />
              </Link>
            </div>

            <div className="flex min-h-0 min-w-0 items-center justify-center px-0.5 sm:px-1">
              <Link
                href="/"
                className={cn(
                  "mad-wordmark max-w-full text-center whitespace-nowrap",
                  /* Mobilde kısaltma yok: vw ile küçülür; md+ sabit 25px */
                  "text-[clamp(0.6875rem,3.9vw,1.5625rem)] md:text-[25px]",
                  "transition-colors duration-300 hover:text-mad-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mad-border-gold-mid)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                  tapHaptic
                )}
              >
                madmonos
              </Link>
            </div>

            <div className="flex min-h-0 min-w-0 items-center justify-end gap-1.5 sm:gap-2 md:gap-3">
              <MagneticProximity
                className="hidden shrink-0 items-center will-change-transform md:flex"
                radius={48}
                pull={0.34}
              >
                <DiscoveryTrigger
                  id="discovery-primary-trigger"
                  variant="ghost"
                  className={cn(
                    "!border-white/10 !bg-black/15 !text-mad-aaa-primary !shadow-none",
                    "!inline-flex !min-h-10 !items-center !justify-center !rounded-full !px-4 !py-2 !text-[10px] !font-bold !uppercase !tracking-[0.14em]",
                    "!backdrop-blur-xl !backdrop-saturate-[1.8]",
                    navChameleonGpu,
                    "transition-[color,background-color,border-color] duration-300 hover:!border-white/20 hover:!text-mad-gold",
                    "[transform:translate3d(0,0,0)]"
                  )}
                >
                  Discovery
                </DiscoveryTrigger>
              </MagneticProximity>

              <DiscoveryTrigger
                id="discovery-primary-trigger-mobile"
                variant="ghost"
                className={cn(
                  "md:!hidden !inline-flex !size-10 !min-h-10 !items-center !justify-center !rounded-full !border !border-white/10 !bg-black/15 !p-0 !text-[9px] !font-bold !uppercase !leading-none !tracking-[0.1em] !text-mad-aaa-primary",
                  "!backdrop-blur-xl !backdrop-saturate-[1.8]",
                  navChameleonGpu,
                  tapHaptic,
                  "[transform:translate3d(0,0,0)]"
                )}
              >
                Start
              </DiscoveryTrigger>

              <button
                type="button"
                className={cn(
                  "inline-flex size-10 shrink-0 items-center justify-center rounded-full sm:size-11",
                  "border border-white/10 bg-black/15 text-mad-aaa-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
                  "backdrop-blur-xl backdrop-saturate-[1.8]",
                  navChameleonGpu,
                  "transition-[color,background-color,border-color] duration-300 hover:border-white/20 hover:text-mad-gold",
                  tapHaptic
                )}
                aria-expanded={menuOpen}
                aria-controls={menuId}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen((o) => !o)}
              >
                <span className="relative block h-3 w-[1.125rem]" aria-hidden>
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-0.5 w-full rounded-full bg-current transition-[transform,top] duration-200 ease-out",
                      menuOpen && "top-1/2 -translate-y-1/2 rotate-45"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 rounded-full bg-current transition-opacity duration-200",
                      menuOpen && "opacity-0"
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-0 bottom-0 h-0.5 w-full rounded-full bg-current transition-[transform,bottom] duration-200 ease-out",
                      menuOpen && "bottom-1/2 translate-y-1/2 -rotate-45"
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        aria-hidden={!menuOpen}
        className={cn(
          "fixed inset-0 z-[45] flex flex-col transition-[visibility,opacity] duration-300 ease-out motion-reduce:transition-none",
          navChameleonGpu,
          menuOpen ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        )}
      >
        <button
          type="button"
          tabIndex={menuOpen ? 0 : -1}
          className={cn(
            "absolute inset-0 border-0 backdrop-blur-2xl backdrop-saturate-[1.8]",
            /* Mobilde daha opak scrim — menü metni okunaklı; masaüstünde biraz daha hafif */
            "max-md:bg-black/80 bg-black/50",
            navChameleonGpu,
            "transition-opacity duration-300",
            !menuOpen && "pointer-events-none"
          )}
          aria-label="Dismiss navigation"
          onClick={() => setMenuOpen(false)}
        />

        <div
          className={cn(
            "relative z-[1] flex min-h-0 flex-1 flex-col justify-end md:items-center md:justify-center md:px-6 md:py-10",
            "transition-opacity duration-300 ease-out motion-reduce:transition-none",
            menuOpen ? "opacity-100" : "opacity-0"
          )}
        >
          <div
            className={cn(
              "relative flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)))] min-h-0 w-full flex-col overflow-hidden rounded-t-[1.75rem] border border-white/10 border-b-0 md:max-h-[min(85dvh,52rem)] md:w-full md:max-w-3xl md:rounded-3xl md:border md:border-white/10",
              navChameleonTint,
              "backdrop-blur-2xl backdrop-saturate-[1.8]",
              navChameleonGpu,
              menuOpen && "motion-safe:[animation:madSheetUp_420ms_cubic-bezier(0.22,1,0.36,1)_both]"
            )}
          >
            <ChameleonEdgeShade className="z-0" />
            <div
              className={cn(
                "relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 md:px-8 md:pb-8 md:pt-5"
              )}
            >
              <div
                className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-white/20 md:hidden"
                aria-hidden
              />
              <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain" aria-label="Primary">
                <ul className="flex flex-col gap-0">
                  {links.map((item) => (
                    <li key={item.href} className="border-b border-white/10">
                      <Link
                        href={item.href}
                        aria-label={item.ariaLabel ?? `${item.label}: ${item.subLabel}`}
                        data-mad-cursor="view"
                        onClick={() => setMenuOpen(false)}
                        className={cn(
                          "nav-link-reveal nav-overlay-link group flex min-h-[4.25rem] items-center justify-between gap-4 py-4 pr-1 sm:min-h-[4.5rem]",
                          tapHaptic
                        )}
                      >
                        <span className="min-w-0 flex-1 text-left">
                          <span
                            className={cn(
                              "nav-overlay-anim-main block font-[family-name:var(--font-display)] text-2xl font-semibold uppercase leading-[1.05] tracking-[-0.02em] text-mad-aaa-primary sm:text-3xl"
                            )}
                          >
                            {item.label}
                          </span>
                          <span
                            className={cn(
                              "nav-overlay-anim-sub mt-1 block font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-mad-aaa-body sm:text-[11px] sm:tracking-[0.22em]"
                            )}
                          >
                            {item.subLabel}
                          </span>
                        </span>
                        <MenuArrowIcon className="opacity-70 transition-opacity duration-300 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-4">
                <a
                  href={CONTACT_MAIL}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 px-4 py-4 backdrop-blur-2xl backdrop-saturate-[1.8]",
                    navChameleonGpu,
                    "transition-[border-color,background-color] duration-300 hover:border-white/20",
                    tapHaptic
                  )}
                >
                  <div className="min-w-0 text-left">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mad-aaa-body">
                      Contact us
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-mad-aaa-primary group-hover:text-mad-gold sm:text-base">
                      Get in touch
                    </p>
                  </div>
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/25 text-mad-gold backdrop-blur-md"
                    aria-hidden
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1 1 0 1 0 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6c0-1 1-1 0-2z" />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    openDiscovery();
                  }}
                  className={cn(
                    "group flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--mad-border-gold-soft)] bg-black/15 px-4 py-4 text-left backdrop-blur-2xl backdrop-saturate-[1.8]",
                    navChameleonGpu,
                    "transition-[border-color,background-color,box-shadow] duration-300 hover:border-[color:var(--mad-border-gold-mid)] hover:shadow-[var(--mad-shadow-cta-gold-pill)]",
                    tapHaptic
                  )}
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-mad-aaa-body">
                      Discovery
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-wide text-mad-gold sm:text-base">
                      Start a project brief
                    </p>
                  </div>
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-mad-gold/15 text-mad-gold ring-1 ring-[color:var(--mad-border-gold-soft)] backdrop-blur-md"
                    aria-hidden
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4.5 16.5c0-1.5 1-2 2-2.5s3.5-1 4.5-3 1-4 1-4" />
                      <path d="M9 15V9h6" />
                      <path d="m15 9 4 4-4 4" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
