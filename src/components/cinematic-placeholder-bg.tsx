"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Düşük opaklıkta marka görseli; yoksa sadece mesh kalır */
  brandImageSrc?: string;
  /**
   * `hero`: statik arka plan (mesh/ken/shimmer animasyonları kapalı), decode önceliği yüksek.
   */
  variant?: "default" | "hero";
};

/**
 * Video yolu olmadığında hero / AI rail için mor-altın “sinema” plaseholder:
 * animasyonlu mesh + isteğe bağlı marka görseli (404’ta kaldırılır) + scan shimmer.
 */
export function CinematicPlaceholderBg({
  className,
  brandImageSrc = "/madmonos.webp",
  variant = "default",
}: Props) {
  const [showBrand, setShowBrand] = useState(true);
  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        isHero && "hero-static-bg",
        !isHero && "[contain:paint]",
        className
      )}
      aria-hidden
    >
      <div className="absolute inset-0 mad-cinematic-mesh [transform:translate3d(0,0,0)]" />
      {showBrand && brandImageSrc ? (
        <Image
          src={brandImageSrc}
          alt=""
          fill
          sizes="100vw"
          priority={isHero}
          loading={isHero ? "eager" : "lazy"}
          className="mad-cinematic-photo absolute inset-0 h-full w-full object-cover opacity-[0.34] [transform:translate3d(0,0,0)]"
          onError={() => setShowBrand(false)}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-mad-base/55 via-transparent to-mad-deep/35 [transform:translate3d(0,0,0)]" />
      <div className="mad-video-shimmer absolute inset-0 opacity-[0.28] mix-blend-soft-light [transform:translate3d(0,0,0)]" />
    </div>
  );
}
