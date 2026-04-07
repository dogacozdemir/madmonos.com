import { cn } from "@/lib/utils";

/** Route-level suspense — minimal, matches studio tone. */
export default function Loading() {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-20",
        "text-mad-highlight [transform:translate3d(0,0,0)]"
      )}
    >
      <div className="h-10 w-10 animate-pulse rounded-2xl border-2 border-[color:var(--mad-border-gold-strong)] border-t-mad-gold" />
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-mad-gold">Loading</p>
    </div>
  );
}
