"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import {
  BOTTLENECK_LABELS,
  safeParseDiscoveryForm,
  URGENCY_LABELS,
  type DiscoveryPayload,
} from "@/lib/discovery-schema";

const STEPS = 4;

const initial: DiscoveryPayload = {
  bottleneck: "gtm-speed",
  bottleneckDetail: "",
  urgency: "quarter",
  name: "",
  email: "",
  company: "",
};

function buildBriefText(data: DiscoveryPayload): string {
  const b = BOTTLENECK_LABELS[data.bottleneck];
  const u = URGENCY_LABELS[data.urgency];
  const co = data.company ? ` · ${data.company}` : "";
  const detail = data.bottleneckDetail?.trim()
    ? ` Context: ${data.bottleneckDetail.trim()}`
    : "";
  return `Madmonos Discovery Brief — ${data.name}${co}. Contact: ${data.email}. Bottleneck: ${b}. Timeline: ${u}.${detail} We'll reply with a concrete next step.`;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DiscoveryModal({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<DiscoveryPayload>(initial);
  const [typedSummary, setTypedSummary] = useState("");
  const [summaryReady, setSummaryReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const overlayRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const stepWrapRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const reset = useCallback(() => {
    setStep(0);
    setForm(initial);
    setTypedSummary("");
    setSummaryReady(false);
    setError(null);
    setDone(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusableInPanel = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter((el) => {
        if (el.tabIndex < 0) return false;
        return el.getClientRects().length > 0;
      });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const list = focusableInPanel();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || (active && !panel.contains(active))) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || (active && !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, step, done, submitting]);

  useEffect(() => {
    if (!isOpen || !overlayRef.current || !panelRef.current) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    const raf = requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(overlay, { opacity: 1, backdropFilter: "blur(20px)" });
        gsap.set(panel, { opacity: 1, scale: 1 });
      } else {
        gsap.killTweensOf([overlay, panel]);
        gsap.set(overlay, { opacity: 0, backdropFilter: "blur(0px)" });
        gsap.set(panel, { opacity: 0, scale: 0.95, transformOrigin: "50% 50%" });
        gsap.to(overlay, {
          opacity: 1,
          backdropFilter: "blur(20px)",
          duration: 0.6,
          ease: "power3.out",
          force3D: true,
        });
        gsap.to(panel, {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
          force3D: true,
        });
      }
      requestAnimationFrame(() => firstFocusRef.current?.focus());
    });
    return () => cancelAnimationFrame(raf);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !stepWrapRef.current) return;
    const wrap = stepWrapRef.current;
    const raf = requestAnimationFrame(() => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const el = wrap.querySelector(`[data-discovery-step="${step}"]`);
      if (!el || !(el instanceof HTMLElement)) return;
      if (reduced) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { opacity: 0, y: 22, filter: "blur(6px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.42,
          ease: "power3.out",
          force3D: true,
        }
      );
    });
    return () => cancelAnimationFrame(raf);
  }, [step, isOpen]);

  useEffect(() => {
    if (step !== 3 || !isOpen) {
      const clear = window.setTimeout(() => {
        setTypedSummary("");
        setSummaryReady(false);
      }, 0);
      return () => window.clearTimeout(clear);
    }

    const full = buildBriefText(form);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      const id = window.setTimeout(() => {
        setTypedSummary(full);
        setSummaryReady(true);
      }, 0);
      return () => window.clearTimeout(id);
    }

    let intervalId: number | undefined;
    const boot = window.setTimeout(() => {
      setTypedSummary("");
      setSummaryReady(false);
      let i = 0;
      intervalId = window.setInterval(() => {
        i += 1;
        setTypedSummary(full.slice(0, i));
        if (i >= full.length) {
          if (intervalId !== undefined) window.clearInterval(intervalId);
          setSummaryReady(true);
        }
      }, 18);
    }, 0);

    return () => {
      window.clearTimeout(boot);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [step, isOpen, form]);

  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const submit = () => {
    setSubmitting(true);
    setError(null);
    const parsed = safeParseDiscoveryForm(form);
    if (!parsed.ok) {
      setError(parsed.message);
      setSubmitting(false);
      return;
    }
    setForm(parsed.data);
    setDone(true);
    setSubmitting(false);
  };

  useEffect(() => {
    if (!done || !successRef.current) return;
    const host = successRef.current;
    const rs = getComputedStyle(document.documentElement);
    const colors = [
      rs.getPropertyValue("--mad-accent").trim(),
      rs.getPropertyValue("--mad-gold").trim(),
      rs.getPropertyValue("--mad-highlight").trim(),
      rs.getPropertyValue("--mad-gold-dark").trim(),
      rs.getPropertyValue("--mad-deep").trim(),
    ].filter(Boolean);
    const spawn: HTMLSpanElement[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette =
      colors.length > 0
        ? colors
        : [
            "var(--mad-accent)",
            "var(--mad-gold)",
            "var(--mad-highlight)",
            "var(--mad-gold-dark)",
            "var(--mad-deep)",
          ];

    for (let i = 0; i < 52; i++) {
      const bit = document.createElement("span");
      bit.setAttribute("aria-hidden", "true");
      const w = 3 + (i % 5);
      const h = 2 + (i % 4);
      bit.style.cssText = [
        "position:absolute",
        "left:50%",
        "top:38%",
        "width:" + w + "px",
        "height:" + h + "px",
        "border-radius:2px",
        "background:" + palette[i % palette.length],
        "pointer-events:none",
        "will-change:transform,opacity",
      ].join(";");
      host.appendChild(bit);
      spawn.push(bit);
      if (reduced) {
        gsap.set(bit, { opacity: 0 });
        continue;
      }
      gsap.set(bit, { x: 0, y: 0, xPercent: -50, yPercent: -50, opacity: 1, rotation: 0 });
      gsap.to(bit, {
        x: (Math.random() - 0.5) * 280,
        y: (Math.random() - 0.5) * 200 - 60,
        rotation: Math.random() * 500 - 250,
        opacity: 0,
        duration: 0.75 + Math.random() * 0.55,
        ease: "power2.out",
        delay: i * 0.008,
        force3D: true,
      });
    }

    return () => {
      spawn.forEach((n) => n.remove());
    };
  }, [done]);

  if (!mounted || !isOpen) return null;

  const modal = (
    <div
      id="discovery-modal"
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center sm:p-6 [pointer-events:auto]"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby="discovery-title"
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-mad-void [pointer-events:auto] [will-change:opacity,backdrop-filter]"
        ref={overlayRef}
        aria-label="Close discovery dialog"
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative z-10 flex max-h-[min(92vh,840px)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-[color:var(--mad-border-highlight-mid)] [pointer-events:auto]",
          "bg-mad-deep backdrop-blur-2xl backdrop-saturate-150 shadow-[var(--mad-shadow-modal)]",
          "[transform:translate3d(0,0,0)]"
        )}
      >
        <div className="pointer-events-none absolute inset-0 mad-grain-panel opacity-[0.2] mix-blend-overlay" />

        <header className="relative z-[1] flex items-start justify-between gap-4 border-b border-[color:var(--mad-border-accent-soft)] px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-mad-gold">
              Mad Genius · Discovery
            </p>
            <h2 id="discovery-title" className="mt-1 text-xl font-bold text-mad-highlight">
              Project discovery
            </h2>
            <p className="mt-1 text-xs text-mad-aaa-body">
              Step {Math.min(step + 1, STEPS)} of {STEPS}
            </p>
          </div>
          <button
            type="button"
            ref={firstFocusRef}
            aria-label="Close project discovery dialog"
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-[color:var(--mad-border-accent-strong)] px-4 py-3 text-xs font-semibold text-mad-highlight transition-colors hover:border-[color:var(--mad-border-gold-focus)] hover:text-mad-gold"
            onClick={handleClose}
          >
            Close
          </button>
        </header>

        <div
          ref={stepWrapRef}
          className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          {done ? (
            <div
              ref={successRef}
              className="relative space-y-4 overflow-visible text-mad-highlight [transform:translate3d(0,0,0)]"
            >
              <p className="relative z-[2] text-lg font-semibold text-mad-highlight">
                Brief received — welcome to the cell.
              </p>
              <p className="relative z-[2] text-sm leading-relaxed text-mad-aaa-body">
                Your bottleneck is logged. Expect a crisp, technical next step — typically within one
                business day — not a generic auto-reply.
              </p>
              <button
                type="button"
                aria-label="Close project discovery dialog after submit"
                className="cta-digital-present relative z-[2] mt-4 rounded-xl bg-mad-gold px-5 py-3 text-sm font-bold text-mad-base"
                onClick={handleClose}
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <div
                data-discovery-step="0"
                className={cn("space-y-5", step !== 0 && "hidden")}
              >
                <p className="text-sm font-medium text-mad-aaa-body">
                  Where is the critical bottleneck today?
                </p>
                <div className="grid gap-2">
                  {(Object.keys(BOTTLENECK_LABELS) as DiscoveryPayload["bottleneck"][]).map(
                    (key) => (
                      <label
                        key={key}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                          form.bottleneck === key
                            ? "border-[color:var(--mad-border-gold-selected)] bg-[color:var(--mad-surface-gold-select)] text-mad-aaa-primary"
                            : "border-[color:var(--mad-border-accent-mid)] bg-[color:var(--mad-surface-modal-input)] text-mad-aaa-body hover:border-[color:var(--mad-border-accent-hover)]"
                        )}
                      >
                        <input
                          type="radio"
                          name="bottleneck"
                          className="mt-1"
                          checked={form.bottleneck === key}
                          onChange={() => setForm((f) => ({ ...f, bottleneck: key }))}
                        />
                        <span>{BOTTLENECK_LABELS[key]}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              <div
                data-discovery-step="1"
                className={cn("space-y-5", step !== 1 && "hidden")}
              >
                <p className="text-sm font-medium text-mad-aaa-body">How urgent is change?</p>
                <div className="grid gap-2">
                  {(Object.keys(URGENCY_LABELS) as DiscoveryPayload["urgency"][]).map((key) => (
                    <label
                      key={key}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                        form.urgency === key
                          ? "border-[color:var(--mad-border-gold-selected)] bg-[color:var(--mad-surface-gold-select)] text-mad-aaa-primary"
                          : "border-[color:var(--mad-border-accent-mid)] bg-[color:var(--mad-surface-modal-input)] text-mad-aaa-body hover:border-[color:var(--mad-border-accent-hover)]"
                      )}
                    >
                      <input
                        type="radio"
                        name="urgency"
                        className="mt-1"
                        checked={form.urgency === key}
                        onChange={() => setForm((f) => ({ ...f, urgency: key }))}
                      />
                      <span>{URGENCY_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
                <label className="block text-sm font-medium text-mad-aaa-body">
                  Context (optional)
                  <textarea
                    value={form.bottleneckDetail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, bottleneckDetail: e.target.value }))
                    }
                    rows={4}
                    className="mt-2 w-full resize-y rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-3 py-2 text-mad-aaa-primary placeholder:text-mad-aaa-body focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                    placeholder="Stack, team size, blockers, KPIs…"
                  />
                </label>
              </div>

              <div
                data-discovery-step="2"
                className={cn("space-y-4", step !== 2 && "hidden")}
              >
                <label className="block text-sm font-medium text-mad-aaa-body">
                  Name
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-3 py-2 text-mad-aaa-primary focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                    autoComplete="name"
                  />
                </label>
                <label className="block text-sm font-medium text-mad-aaa-body">
                  Work email
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-3 py-2 text-mad-aaa-primary focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                    autoComplete="email"
                  />
                </label>
                <label className="block text-sm font-medium text-mad-aaa-body">
                  Company (optional)
                  <input
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-3 py-2 text-mad-aaa-primary focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                    autoComplete="organization"
                  />
                </label>
              </div>

              <div
                data-discovery-step="3"
                className={cn("space-y-4", step !== 3 && "hidden")}
              >
                <p className="text-sm font-medium text-mad-aaa-gold">Mad Genius summary</p>
                <div className="min-h-[7rem] rounded-xl border border-[color:var(--mad-border-accent-mid)] bg-[color:var(--mad-surface-modal-input)] p-4 font-mono text-xs leading-relaxed text-mad-aaa-primary md:text-sm">
                  {typedSummary}
                  <span className="inline-block h-4 w-0.5 animate-pulse bg-mad-aaa-gold align-middle" />
                </div>
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
              </div>
            </>
          )}
        </div>

        {!done ? (
          <footer className="relative z-[1] flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--mad-border-accent-soft)] px-6 py-4">
            <button
              type="button"
              className="rounded-xl border border-[color:var(--mad-border-accent-heavy)] px-4 py-2.5 text-sm font-semibold text-mad-highlight transition-colors hover:border-[color:var(--mad-border-gold-hover)] disabled:pointer-events-none disabled:border-[color:var(--mad-border-accent-faint)] disabled:text-mad-text-disabled"
              disabled={step === 0}
              onClick={back}
            >
              Back
            </button>
            <div className="flex gap-2">
              {step < STEPS - 1 ? (
                <button
                  type="button"
                  className="cta-digital-present rounded-xl bg-mad-gold px-5 py-2.5 text-sm font-bold text-mad-base"
                  onClick={next}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="cta-digital-present rounded-xl bg-mad-gold px-5 py-2.5 text-sm font-bold text-mad-base disabled:pointer-events-none disabled:bg-mad-gold-dark disabled:text-mad-base"
                  disabled={submitting || !summaryReady}
                  onClick={submit}
                >
                  {submitting ? "Sending…" : "Submit brief"}
                </button>
              )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
