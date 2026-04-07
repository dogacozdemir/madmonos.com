import Link from "next/link";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div
      className={cn(
        "relative flex min-h-[100svh] flex-col items-center justify-center gap-8 px-6",
        "bg-mad-base text-center [transform:translate3d(0,0,0)]"
      )}
    >
      <div className="pointer-events-none absolute inset-0 mad-grain opacity-[0.08]" aria-hidden />
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-mad-gold">Error</p>
      <h1 className="max-w-md text-3xl font-extrabold tracking-tight text-mad-highlight md:text-4xl">
        404: Lost in the madness.
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-mad-aaa-body">
        This page drifted off the GTM map. Head back to known territory.
      </p>
      <Link
        href="/"
        className="cta-digital-present rounded-xl bg-mad-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-mad-base"
      >
        Back to Sanity
      </Link>
    </div>
  );
}
