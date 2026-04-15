"use client";

import { useDiscovery } from "@/components/discovery/discovery-context";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "gold" | "ghost";
};

export function DiscoveryTrigger({
  id,
  className,
  children,
  variant = "gold",
}: Props) {
  const { open, isOpen } = useDiscovery();

  return (
    <button
      id={id}
      type="button"
      data-mad-cursor="discover"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="discovery-modal"
      onClick={open}
      className={cn(
        "cta-digital-present inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.15em] transition-colors md:text-sm",
        variant === "gold"
          ? "bg-mad-gold text-mad-base shadow-[var(--mad-shadow-cta-gold-pill)]"
          : "border border-[color:var(--mad-border-accent-heavy)] bg-[color:var(--mad-surface-panel-plum)] text-mad-aaa-primary backdrop-blur-sm",
        className
      )}
    >
      {children ?? "Request callback"}
    </button>
  );
}
