"use client";

import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { DeferredChrome } from "@/components/providers/deferred-chrome";
import { DiscoveryProvider } from "@/components/discovery/discovery-context";
import { PagePreloader } from "@/components/page-preloader";
import { SitePlaneController } from "@/components/site-plane-controller";
import { TeamSpotlightNavProvider } from "@/components/providers/team-spotlight-nav-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <TeamSpotlightNavProvider>
        <DiscoveryProvider>
          <SitePlaneController />
          <PagePreloader />
          <DeferredChrome />
          {children}
        </DiscoveryProvider>
      </TeamSpotlightNavProvider>
    </SmoothScrollProvider>
  );
}
