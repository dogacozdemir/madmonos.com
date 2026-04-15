"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { safeParseDiscoveryForm, type DiscoveryPayload } from "@/lib/discovery-schema";

const initial: DiscoveryPayload = {
  name: "",
  phone: "",
  company: "",
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function DiscoveryModal({ isOpen, onClose }: Props) {
  const endpoint = "/api/leads";
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<DiscoveryPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const hasError = Boolean(error);

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
    setForm(initial);
    setError(null);
    setDone(false);
    setSubmitting(false);
    setStatusText(null);
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
    document.body.classList.add("mad-modal-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.classList.remove("mad-modal-open");
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
  }, [isOpen, done, submitting]);

  useEffect(() => {
    if (!isOpen || !overlayRef.current || !panelRef.current) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    let cancelled = false;
    const raf = requestAnimationFrame(() => {
      void import("gsap").then(({ default: gsap }) => {
        if (cancelled) return;
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
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [isOpen]);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setStatusText("Submitting your request...");
    const parsed = safeParseDiscoveryForm(form);
    if (!parsed.ok) {
      setError(parsed.message);
      setSubmitting(false);
      return;
    }
    const payload = {
      date: new Date().toISOString(),
      name: parsed.data.name,
      phone: parsed.data.phone,
      company: parsed.data.company,
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || `Lead submit failed: ${response.status}`);
      }

      setForm(initial);
      setDone(true);
      setStatusText("Request sent successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
      setStatusText(null);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const modal = (
    <div
      id="discovery-modal"
      className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center sm:p-6 [pointer-events:auto]"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-labelledby={done ? "discovery-success-title" : "discovery-title"}
    >
      <button
        type="button"
        tabIndex={-1}
        className="absolute inset-0 bg-[rgba(5,3,8,0.46)] [pointer-events:auto] [will-change:opacity,backdrop-filter]"
        ref={overlayRef}
        aria-label="Close discovery dialog"
        onClick={handleClose}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden rounded-3xl border border-[color:var(--mad-border-highlight-mid)] [pointer-events:auto]",
          done ? "max-w-md" : "max-h-[min(92vh,840px)] max-w-xl",
          "bg-[color:rgba(54,23,56,0.86)] backdrop-blur-2xl backdrop-saturate-150 shadow-[var(--mad-shadow-modal)]",
          "[transform:translate3d(0,0,0)]"
        )}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[rgba(201,174,85,0.16)] via-[rgba(201,174,85,0.06)] to-transparent"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 mad-grain-panel opacity-[0.2] mix-blend-overlay" />

        {!done ? (
          <header className="relative z-[3] flex items-start justify-between border-b border-[color:var(--mad-border-accent-soft)] px-6 pb-3 pt-4">
            <p
              id="discovery-title"
              className="inline-flex h-11 items-center text-xs font-semibold uppercase tracking-[0.22em] text-mad-gold"
            >
              Let us call you!
            </p>
            <button
              type="button"
              ref={firstFocusRef}
              aria-label="Close callback dialog"
              className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[color:var(--mad-border-accent-strong)] px-4 text-sm font-semibold text-mad-highlight transition-colors hover:border-[color:var(--mad-border-gold-focus)] hover:text-mad-gold"
              onClick={handleClose}
            >
              Close
            </button>
          </header>
        ) : null}

        <div
          ref={stepWrapRef}
          className={cn(
            "relative z-[2] min-h-0 flex-1 overflow-visible px-6",
            done ? "flex min-h-[180px] items-center justify-center py-8" : "flex items-center py-6"
          )}
        >
          {done ? (
            <div
              ref={successRef}
              className={cn(
                "relative mx-auto w-full max-w-[24rem] overflow-visible text-center text-mad-highlight [transform:translate3d(0,0,0)]"
              )}
            >
              <p
                id="discovery-success-title"
                className="relative z-[2] text-[clamp(1.05rem,2.2vw,1.35rem)] font-semibold leading-tight tracking-[-0.01em] text-mad-highlight"
              >
                Our Monos will contact you
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mad-aaa-body">
                Your request has been received successfully. We will reach out as soon as possible.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-[color:var(--mad-border-accent-strong)] px-5 py-2.5 text-sm font-semibold text-mad-highlight transition-colors hover:border-[color:var(--mad-border-gold-focus)] hover:text-mad-gold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form
              data-discovery-step="0"
              className="mx-auto mt-16 w-full max-w-[38rem] space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              <label htmlFor="discovery-name" className="block text-sm font-medium text-mad-aaa-body">
                <span className="mb-1.5 block">Name</span>
                <input
                  id="discovery-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  disabled={submitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "discovery-form-error" : undefined}
                  className="h-12 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-4 text-mad-aaa-primary placeholder:text-mad-aaa-body/70 focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                  autoComplete="name"
                  placeholder="Your full name"
                />
              </label>
              <label htmlFor="discovery-phone" className="block text-sm font-medium text-mad-aaa-body">
                <span className="mb-1.5 block">Phone</span>
                <input
                  id="discovery-phone"
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  disabled={submitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "discovery-form-error" : undefined}
                  className="h-12 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-4 text-mad-aaa-primary placeholder:text-mad-aaa-body/70 focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                  autoComplete="tel"
                  placeholder="+1 555 123 4567"
                />
              </label>
              <label htmlFor="discovery-company" className="block text-sm font-medium text-mad-aaa-body">
                <span className="mb-1.5 block">Company</span>
                <input
                  id="discovery-company"
                  required
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  disabled={submitting}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? "discovery-form-error" : undefined}
                  className="h-12 w-full rounded-xl border border-[color:var(--mad-border-accent-strong)] bg-[color:var(--mad-surface-modal-input)] px-4 text-mad-aaa-primary placeholder:text-mad-aaa-body/70 focus:border-[color:var(--mad-border-gold-focus)] focus:outline-none"
                  autoComplete="organization"
                  placeholder="Company name"
                />
              </label>
              {error ? (
                <p id="discovery-form-error" role="alert" className="text-sm text-red-300">
                  {error}
                </p>
              ) : null}
              {statusText ? (
                <p className="text-sm text-mad-aaa-body" role="status" aria-live="polite">
                  {statusText}
                </p>
              ) : null}
              <button type="submit" className="hidden" aria-hidden />
            </form>
          )}
        </div>

        {!done ? (
          <footer className="relative z-[1] flex items-center justify-end border-t border-[color:var(--mad-border-accent-soft)] px-6 py-4">
            <button
              type="button"
              className="cta-digital-present rounded-xl bg-mad-gold px-5 py-2.5 text-sm font-bold text-mad-base disabled:pointer-events-none disabled:bg-mad-gold-dark disabled:text-mad-base"
              disabled={submitting}
              onClick={() => void submit()}
            >
              {submitting ? "Sending..." : "Request callback"}
            </button>
          </footer>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
