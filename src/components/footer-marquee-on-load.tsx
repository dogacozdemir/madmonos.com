"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = { children: React.ReactNode; className?: string };

/**
 * Marquee: sadece `window` "load" sonrası görünür (font + kritik kaynaklar hazır).
 * Dışarıdaki sabit yükseklik CLS oluşturmaz.
 */
export function FooterMarqueeOnLoad({ children, className }: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onLoad = () => setReady(true);
    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div
      className={cn(
        "min-h-[max(4rem,min(9vw,7rem))] [will-change:opacity,transform] motion-reduce:transition-none",
        ready ? "opacity-[0.26]" : "opacity-0",
        className
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}
