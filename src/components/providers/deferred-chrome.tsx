"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { idleBootstrapMs } from "@/lib/mobile-perf";
import { runWhenIdle } from "@/lib/run-when-idle";

const CursorFollower = dynamic(
  () => import("@/components/cursor-follower").then((m) => m.CursorFollower),
  { ssr: false, loading: () => null }
);

const DiscoveryFab = dynamic(
  () => import("@/components/discovery/discovery-fab").then((m) => m.DiscoveryFab),
  { ssr: false, loading: () => null }
);

const SiteVignette = dynamic(
  () => import("@/components/site-vignette").then((m) => m.SiteVignette),
  { ssr: false, loading: () => null }
);

/** Cursor, vignette, and FAB load in an idle chunk after first paint. */
export function DeferredChrome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    return runWhenIdle(() => setMounted(true), idleBootstrapMs());
  }, []);

  if (!mounted) return null;

  return (
    <>
      <SiteVignette />
      <CursorFollower />
      <DiscoveryFab />
    </>
  );
}
