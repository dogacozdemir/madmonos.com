/**
 * Server Component — no "use client".
 *
 * Renders a request-scoped system-status strip at the bottom of the main content
 * column. Because page.tsx already opts into dynamic SSR via headers(), this
 * timestamp is genuinely fresh on every request — not a build-time constant.
 *
 * The pulsing dot is a pure-CSS animation (mad-pulse-dot defined in globals.css).
 * No JS payload, no hydration cost.
 */

type Props = {
  /** ISO-8601 timestamp produced in page.tsx server context. */
  syncedAt: string;
};

export function SystemPulse({ syncedAt }: Props) {
  const d = new Date(syncedAt);
  const timeStr = [
    d.getUTCHours().toString().padStart(2, "0"),
    d.getUTCMinutes().toString().padStart(2, "0"),
    d.getUTCSeconds().toString().padStart(2, "0"),
  ].join(":");

  return (
    <div
      className="relative z-[5] border-t border-[color:var(--mad-border-accent-faint)] bg-mad-deep"
      role="status"
      aria-label="System status"
      aria-live="off"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-2 px-6 py-3 md:px-12">
        {/* Live indicators */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.22em]">
            <span
              className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-emerald-400 [animation:mad-pulse-dot_2.4s_ease-in-out_infinite] motion-reduce:[animation:none]"
              aria-hidden
            />
            <span className="text-emerald-400/75">AI Engine: Active</span>
          </span>

          <span
            className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mad-aaa-body/45 sm:inline"
            aria-hidden
          >
            ·
          </span>

          <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mad-aaa-body/50 sm:inline">
            Network: Accelerated
          </span>

          <span
            className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mad-aaa-body/45 md:inline"
            aria-hidden
          >
            ·
          </span>

          <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-mad-aaa-body/50 md:inline">
            System: Optimised
          </span>
        </div>

        {/* Request-scoped sync timestamp */}
        <p className="font-mono text-[10px] font-medium tracking-[0.16em] text-mad-aaa-body/35">
          Last Sync:{" "}
          <time dateTime={syncedAt} className="text-mad-aaa-body/55">
            {timeStr} UTC
          </time>
        </p>
      </div>
    </div>
  );
}
