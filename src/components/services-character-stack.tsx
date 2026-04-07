"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MORPHING_SERVICES } from "@/data/mad-genius-copy";

const SRC_BY_ID: Record<(typeof MORPHING_SERVICES)[number]["id"], string> = {
  "ai-creative": "/creative.webp",
  "web-dev": "/developer.webp",
  automation: "/agent.webp",
  "seo-geo": "/performance.webp",
  strategy: "/strategy.webp",
};

type ServicesCharacterStackProps = {
  className?: string;
};

export const ServicesCharacterStack = forwardRef<
  HTMLDivElement,
  ServicesCharacterStackProps
>(function ServicesCharacterStack({ className }, ref) {
  return (
    <div
      ref={ref}
      className={cn(
        "pointer-events-none flex select-none items-center justify-center",
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          "relative aspect-square max-h-[min(60vh,620px)] w-[min(78vw,min(60vh,620px))] max-w-none"
        )}
      >
        <div className="absolute inset-0 mix-blend-screen">
          {MORPHING_SERVICES.map((item, i) => (
            <div
              key={item.id}
              data-service-character
              className={cn(
                "absolute inset-0",
                i === 0 ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={SRC_BY_ID[item.id]}
                alt=""
                fill
                sizes="(max-width: 768px) min(40vw, 360px), (max-width: 1200px) min(78vw, 620px), min(620px, 38vw)"
                className="object-contain object-center"
                draggable={false}
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : undefined}
              />
            </div>
          ))}
        </div>

        <div
          data-service-char-flicker
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-overlay opacity-0"
          style={{
            backgroundImage: [
              "repeating-linear-gradient(0deg, transparent, transparent 1px, var(--mad-char-scan-line-light) 1px, var(--mad-char-scan-line-light) 2px)",
              "repeating-linear-gradient(90deg, transparent, transparent 6px, var(--mad-char-scan-line-plum) 6px, var(--mad-char-scan-line-plum) 7px)",
            ].join(","),
          }}
          aria-hidden
        />
      </div>
    </div>
  );
});
