import { headers } from "next/headers";
import { HeroMaskedDigitalPresent } from "@/components/hero-masked-digital-present";
import { HeroMobile } from "@/components/hero-mobile";
import { HorizontalServiceScroll } from "@/components/horizontal-service-scroll";
import { ServicesMobile } from "@/components/services-mobile";
import { ProjectsMobile } from "@/components/projects-mobile";
import { LatestNews } from "@/components/latest-news";
import { SolutionsSemantic } from "@/components/solutions-semantic";
import { SpotlightTeamStage } from "@/components/team/spotlight-team-stage";
import { SpotlightTeamMobile } from "@/components/team/spotlight-team-mobile";
import { StructuredData } from "@/components/structured-data";
import { StickySolutions } from "@/components/sticky-solutions";
import { SystemPulse } from "@/components/system-pulse";
import { TypographyImpactSection } from "@/components/typography-impact-section";
import { getBlogPosts } from "@/lib/blog-posts";
import { MarTechMarquee } from "@/components/martech-marquee";
import { isUaMobile } from "@/lib/device";

/**
 * Server-rendered route with UA-based component branching.
 *
 * Mobile UA  → lightweight shells: no video, no GSAP 500vh scroll traps, no flip cards.
 *              Every section is a single vertical scroll with immediately visible content.
 * Desktop UA → full cinematic experience with GSAP scroll-pinning and 3-D interactions.
 *
 * headers() opts into dynamic SSR; blog data remains cached at the fetch level.
 */
export default async function Home() {
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const mobile = isUaMobile(ua);

  // Request-scoped timestamp — fresh on every SSR render.
  // Proves the "Operations" pillar: site is a live machine, not a cached artifact.
  const syncedAt = new Date().toISOString();

  const posts = await getBlogPosts();

  return (
    <>
      <StructuredData />
      <main className="relative z-[2]">
        {mobile ? <HeroMobile /> : <HeroMaskedDigitalPresent />}

        {mobile ? <ProjectsMobile /> : <StickySolutions />}

        {mobile ? <SpotlightTeamMobile /> : <SpotlightTeamStage />}

        <TypographyImpactSection />

        {mobile ? <ServicesMobile /> : <HorizontalServiceScroll />}

        <LatestNews posts={posts} />
        <SolutionsSemantic />
        <MarTechMarquee />
        <SystemPulse syncedAt={syncedAt} />
      </main>
    </>
  );
}
